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

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SelectTypeahead from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
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
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import {
  getNadFullName,
  getNameAndNs,
  hasExplicitlyDefinedPodNetwork,
  isNadFullName,
  isOvnOverlayNad,
  podNetworkExists,
} from '../../utils/helpers';
import useNADsData from '../hooks/useNADsData';

import NetworkSelectHelperPopover from './components/NetworkSelectHelperPopover/NetworkSelectHelperPopover';
import { buildNetworkSelectOptions, getShowPodNetworkingOption } from './editNetworkSelectUtils';
import { NetworkSelectTypeaheadOptionProps } from './types';
import useEditNetworkSelect from './useEditNetworkSelect';
import { createNewNetworkOption, getCreateNetworkOption, validateNADNamespace } from './utils';

export type { NetworkSelectTypeaheadOptionProps } from './types';

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
  const vmiNamespace = getNamespace(vm) || namespace;
  const { loaded, loadError, nads, primaryNADs } = useNADsData(vmiNamespace, getCluster(vm));
  const [isNamespaceManagedByUDN] = useNamespaceUDN(vmiNamespace);
  const podNetworkType = isNamespaceManagedByUDN
    ? interfaceTypesProxy.l2bridge
    : interfaceTypesProxy.masquerade;
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

  const {
    filteredNADs,
    selectedFirstOnLoad,
    selectNetworkName,
    selectTypeaheadKey,
    setSelectedFirstOnLoad,
  } = useEditNetworkSelect({
    currentlyUsedNADFullNames,
    editInitValueNetworkName,
    isEditing,
    loaded,
    nads,
    networkName,
    setSubmitDisabled,
    vmiNamespace,
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
  const showPodNetworkingOption = getShowPodNetworkingOption({
    editInitValueNetworkName,
    hasPodNetwork,
    isEditing,
  });

  const canCreateNetworkInterface = useMemo(
    () => hasNads || !hasPodNetwork,
    [hasNads, hasPodNetwork],
  );

  const podNetworkingText = useMemo(() => t('Pod Networking'), [t]);

  const networkOptions = useMemo(
    () =>
      buildNetworkSelectOptions({
        createdNetworkOptions,
        editInitValueNetworkName,
        filteredNADs,
        isEditing,
        podNetworkingText,
        podNetworkType,
        selectNetworkName,
        showPodNetworkingOption,
        vmiNamespace,
      }),
    [
      showPodNetworkingOption,
      filteredNADs,
      podNetworkingText,
      vmiNamespace,
      createdNetworkOptions,
      podNetworkType,
      isEditing,
      editInitValueNetworkName,
      selectNetworkName,
    ],
  );

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

  useEffect(() => {
    if (networkName || isEditing) {
      return;
    }

    if (loaded && !loadError && !selectedFirstOnLoad) {
      setSelectedFirstOnLoad(true);
      const networkToPreselect = networkOptions?.[0]?.value;
      if (networkToPreselect) {
        handleChange(networkToPreselect);
      }
      return;
    }

    if (loaded && (loadError || !canCreateNetworkInterface)) {
      setSubmitDisabled(true);
    }
  }, [
    loadError,
    canCreateNetworkInterface,
    isEditing,
    loaded,
    networkName,
    networkOptions,
    selectedFirstOnLoad,
    setSelectedFirstOnLoad,
    setSubmitDisabled,
    handleChange,
  ]);

  useEffect(() => {
    if (networkName && !isEditing) {
      setSubmitDisabled(false);
    }
  }, [isEditing, networkName, setSubmitDisabled]);

  return (
    <FormGroup
      fieldId="network-attachment-definition"
      isRequired
      label={t('Network')}
      labelHelp={<NetworkSelectHelperPopover />}
    >
      <div data-test-id="network-attachment-definition-select">
        {hasPodNetwork && !loaded ? (
          <Loading />
        ) : (
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
            key={selectTypeaheadKey}
            options={networkOptions}
            placeholder={t('Select a NetworkAttachmentDefinition')}
            selectedValue={selectNetworkName}
            setSelectedValue={handleChange}
          />
        )}
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
