import React, {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import SelectTypeahead, {
  SelectTypeaheadOptionProps,
} from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIsIPv6SingleStackCluster';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import {
  getNetworks,
  NAD_TYPE_OVN_K8S_CNI_OVERLAY,
  POD_NETWORK,
} from '@kubevirt-utils/resources/vm';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { hasAutoAttachedPodNetwork } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { getCluster } from '@multicluster/helpers/selectors';
import { FormGroup, Label, ValidatedOptions } from '@patternfly/react-core';

import {
  getNadFullName,
  getNadType,
  getNameAndNs,
  hasExplicitlyDefinedPodNetwork,
  isNadFullName,
  isNADUsedInVM,
  isOvnOverlayNad,
  isPodNetworkName,
  podNetworkExists,
} from '../../utils/helpers';
import useNADsData from '../hooks/useNADsData';

import NetworkSelectHelperPopover from './components/NetworkSelectHelperPopover/NetworkSelectHelperPopover';
import { createNewNetworkOption, getCreateNetworkOption, validateNADNamespace } from './utils';

type NetworkInterfaceNetworkSelectProps = {
  editInitValueNetworkName?: string | undefined;
  isEditing?: boolean | undefined;
  namespace?: string;
  networkName: string;
  setInterfaceType: Dispatch<SetStateAction<string>>;
  setNetworkName: Dispatch<SetStateAction<string>>;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
  vm: V1VirtualMachine;
};

export type NetworkSelectTypeaheadOptionProps = SelectTypeaheadOptionProps & {
  type: string;
};

const NetworkInterfaceNetworkSelect: FC<NetworkInterfaceNetworkSelectProps> = ({
  editInitValueNetworkName,
  isEditing,
  namespace,
  networkName,
  setInterfaceType,
  setNetworkName,
  setSubmitDisabled,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(getCluster(vm));
  const vmiNamespace = vm?.metadata?.namespace || namespace;
  const { loaded, loadError, nads, primaryNADs } = useNADsData(vmiNamespace, getCluster(vm));
  const [isNamespaceManagedByUDN] = useNamespaceUDN(vmiNamespace);
  const podNetworkType = isNamespaceManagedByUDN
    ? interfaceTypesProxy.l2bridge
    : interfaceTypesProxy.masquerade;
  const [selectedFirstOnLoad, setSelectedFirstOnLoad] = useState(false);
  const [createdNetworkOptions, setCreatedNetworkOptions] = useState<
    NetworkSelectTypeaheadOptionProps[]
  >([]);

  const currentlyUsedNADFullNames = useMemo(
    () =>
      getNetworks(vm)
        ?.map((network) => network?.multus?.networkName)
        .filter(Boolean)
        .map((name) =>
          isNadFullName(name) ? name : getNadFullName({ name, namespace: getNamespace(vm) }),
        ) ?? [],
    [vm],
  );

  const filteredNADs = nads?.filter((nad) => {
    const isNADInUse = isNADUsedInVM(nad, currentlyUsedNADFullNames);
    return !isNADInUse || !isOvnOverlayNad(nad);
  });

  const ovnNADFullNames =
    nads?.filter(isOvnOverlayNad).map((nad) => getNadFullName(getNameAndNs(nad))) ?? [];

  const validators: ((fullName: string) => ReactNode)[] = [
    (fullName) =>
      primaryNADs.map((nad) => getNadFullName(getNameAndNs(nad))).includes(fullName) &&
      t('Primary user-defined network cannot be used as a secondary network.'),
    (fullName) =>
      currentlyUsedNADFullNames.includes(fullName) &&
      ovnNADFullNames.includes(fullName) &&
      t('NetworkAttachmentDefinition of type [{{type}}] can be only used once.', {
        type: NAD_TYPE_OVN_K8S_CNI_OVERLAY,
      }),
    (fullName) => validateNADNamespace(fullName, vmiNamespace),
  ];

  const hasPodNetwork = useMemo(() => podNetworkExists(vm), [vm]);
  const hasNads = useMemo(() => filteredNADs?.length > 0, [filteredNADs]);
  const isPodNetworkingOptionExists = isIPv6SingleStack
    ? false
    : !hasPodNetwork || (isEditing && isPodNetworkName(editInitValueNetworkName));

  const canCreateNetworkInterface = useMemo(
    () => hasNads || !hasPodNetwork,
    [hasNads, hasPodNetwork],
  );

  const podNetworkingText = useMemo(() => t('Pod Networking'), [t]);

  const networkOptions: NetworkSelectTypeaheadOptionProps[] = useMemo(() => {
    const options = filteredNADs?.map((nad) => {
      const { name, namespace: nadNamespace } = nad?.metadata;
      const type = getNadType(nad);
      const displayedValue = `${nadNamespace}/${name}`;
      const value = nadNamespace === vmiNamespace ? name : displayedValue;
      return {
        label: displayedValue,
        optionProps: {
          children: (
            <>
              {displayedValue} <Label isCompact>{getNadType(nad)} Binding</Label>
            </>
          ),
          key: value,
        },
        type,
        value,
      };
    });

    if (isPodNetworkingOptionExists) {
      options.unshift({
        label: podNetworkingText,
        optionProps: {
          children: (
            <>
              {podNetworkingText} <Label isCompact>{podNetworkType} Binding</Label>
            </>
          ),
          key: POD_NETWORK,
        },
        type: podNetworkType,
        value: POD_NETWORK,
      });
    }

    return [
      ...options,
      ...createdNetworkOptions.filter(({ value }) =>
        options.every((option) => option.value !== value),
      ),
    ];
  }, [
    isPodNetworkingOptionExists,
    filteredNADs,
    podNetworkingText,
    vmiNamespace,
    createdNetworkOptions,
    podNetworkType,
  ]);

  const validated =
    canCreateNetworkInterface || isEditing ? ValidatedOptions.default : ValidatedOptions.error;

  const handleChange = useCallback(
    (value: string) => {
      setNetworkName(value);
      setInterfaceType(
        value === POD_NETWORK
          ? podNetworkType
          : networkOptions.find((netOption) => value === netOption?.value)?.type,
      );
    },
    [setNetworkName, setInterfaceType, networkOptions, podNetworkType],
  );

  // This useEffect is to handle the submit button and init value
  useEffect(() => {
    // if networkName exists, we have the option to create a NIC either with pod networking or by existing NAD
    if (networkName) {
      setSubmitDisabled(false);
      return;
    }

    // if networkName is empty, we can create a NIC with existing NAD if there is one
    if (loaded && !loadError && !selectedFirstOnLoad) {
      setSelectedFirstOnLoad(true);
      const networkToPreselect = networkOptions?.[0]?.value;
      if (networkToPreselect) {
        handleChange(networkToPreselect);
      }
      return;
    }

    // if no nads and pod network already exists, we can't create a NIC
    if (loaded && (loadError || !canCreateNetworkInterface)) {
      setSubmitDisabled(true);
      return;
    }
  }, [
    loadError,
    canCreateNetworkInterface,
    loaded,
    networkName,
    networkOptions,
    selectedFirstOnLoad,
    setNetworkName,
    setSubmitDisabled,
    handleChange,
  ]);

  return (
    <FormGroup
      fieldId="network-attachment-definition"
      isRequired
      label={t('Network')}
      labelHelp={<NetworkSelectHelperPopover />}
    >
      <div data-test-id="network-attachment-definition-select">
        <SelectTypeahead
          addOption={(value) => {
            const hasErrors = validators
              .map((getErrorMsg) => getErrorMsg(value))
              .filter(Boolean).length;
            if (hasErrors) {
              return false;
            }
            setCreatedNetworkOptions((prev) => [
              ...prev.filter((option) => option.value !== value),
              createNewNetworkOption(value),
            ]);
            return true;
          }}
          canCreate
          dataTestId="select-nad"
          getCreateAction={getCreateNetworkOption(validators)}
          isFullWidth
          key={selectedFirstOnLoad ? 'select-nad-with-preselect' : 'select-nad-without-preselect'}
          options={networkOptions}
          placeholder={t('Select a NetworkAttachmentDefinition')}
          selectedValue={networkName}
          setSelectedValue={handleChange}
        />
      </div>
      {loaded && validated === ValidatedOptions.error && (
        <FormGroupHelperText validated={validated}>
          {t(
            'No NetworkAttachmentDefinitions available. Contact your system administrator for additional support.',
          )}
        </FormGroupHelperText>
      )}
      {!hasExplicitlyDefinedPodNetwork(vm) && hasAutoAttachedPodNetwork(vm) && (
        <FormGroupHelperText validated={ValidatedOptions.warning}>
          {t(
            'This VM is using auto attached Pod Network. To disable it, set spec.template.spec.domain.devices.autoattachPodInterface to false.',
          )}
        </FormGroupHelperText>
      )}
    </FormGroup>
  );
};

export default NetworkInterfaceNetworkSelect;
