import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SelectTypeahead, {
  SelectTypeaheadOptionProps,
} from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import { isPodNetworkName, podNetworkExists } from '../../utils/helpers';
import useNADsData from '../hooks/useNADsData';

import NetworkSelectHelperPopover from './components/NetworkSelectHelperPopover/NetworkSelectHelperPopover';
import {
  buildNetworkOptions,
  createNewNetworkOption,
  filterNADs,
  getCreateNetworkOption,
  getInterfaceTypeFromValue,
  getOriginalNetworkName,
  parseNetworkName,
} from './utils';

type NetworkInterfaceNetworkSelectProps = {
  isEditing?: boolean;
  namespace?: string;
  networkName: string;
  nicName?: string;
  setInterfaceType: Dispatch<SetStateAction<string>>;
  setNetworkName: Dispatch<SetStateAction<string>>;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
  vm: V1VirtualMachine;
};

export type NetworkSelectTypeaheadOptionProps = SelectTypeaheadOptionProps & {
  type: string;
};

const NetworkInterfaceNetworkSelect: FC<NetworkInterfaceNetworkSelectProps> = ({
  isEditing,
  namespace,
  networkName,
  nicName,
  setInterfaceType,
  setNetworkName,
  setSubmitDisabled,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const vmiNamespace = vm?.metadata?.namespace || namespace;
  const { loaded, loadError, nads } = useNADsData(vmiNamespace, getCluster(vm));
  const [isNamespaceManagedByUDN] = useNamespaceUDN(vmiNamespace);
  const podNetworkType = isNamespaceManagedByUDN
    ? interfaceTypesProxy.l2bridge
    : interfaceTypesProxy.masquerade;
  const [selectedFirstOnLoad, setSelectedFirstOnLoad] = useState(false);
  const [createdNetworkOptions, setCreatedNetworkOptions] = useState<
    NetworkSelectTypeaheadOptionProps[]
  >([]);

  // Derive original network name from VM's networks when editing
  const originalNetworkNameToUse = useMemo(
    () => (isEditing ? getOriginalNetworkName(vm, nicName) : null),
    [isEditing, nicName, vm],
  );

  // Parse network names for filtering
  const currentNetworkNameParsed = useMemo(
    () =>
      parseNetworkName(isEditing ? networkName || originalNetworkNameToUse : null, vmiNamespace),
    [isEditing, networkName, originalNetworkNameToUse, vmiNamespace],
  );

  const originalNetworkNameParsed = useMemo(
    () => parseNetworkName(originalNetworkNameToUse, vmiNamespace),
    [originalNetworkNameToUse, vmiNamespace],
  );

  const filteredNADs = useMemo(
    () =>
      filterNADs(
        nads,
        vm,
        isEditing,
        currentNetworkNameParsed,
        originalNetworkNameParsed,
        vmiNamespace,
      ),
    [nads, vm, isEditing, currentNetworkNameParsed, originalNetworkNameParsed, vmiNamespace],
  );

  const hasPodNetwork = useMemo(() => podNetworkExists(vm), [vm]);
  const hasNads = useMemo(() => filteredNADs?.length > 0, [filteredNADs]);

  const isPodNetworkingOptionExists = useMemo(
    () =>
      !hasPodNetwork ||
      (isEditing && (isPodNetworkName(networkName) || isPodNetworkName(originalNetworkNameToUse))),
    [hasPodNetwork, isEditing, networkName, originalNetworkNameToUse],
  );

  const canCreateNetworkInterface = useMemo(
    () => hasNads || !hasPodNetwork,
    [hasNads, hasPodNetwork],
  );

  const podNetworkingText = useMemo(() => t('Pod Networking'), [t]);

  const networkOptions: NetworkSelectTypeaheadOptionProps[] = useMemo(
    () =>
      buildNetworkOptions({
        createdNetworkOptions,
        filteredNADs,
        isEditing,
        isPodNetworkingOptionExists,
        originalNetworkName: originalNetworkNameToUse,
        podNetworkingText,
        podNetworkType,
        vmiNamespace,
      }),
    [
      createdNetworkOptions,
      filteredNADs,
      isEditing,
      isPodNetworkingOptionExists,
      originalNetworkNameToUse,
      podNetworkType,
      podNetworkingText,
      vmiNamespace,
    ],
  );

  const validated =
    canCreateNetworkInterface || isEditing ? ValidatedOptions.default : ValidatedOptions.error;

  const handleChange = useCallback(
    (value: string) => {
      setNetworkName(value);
      setInterfaceType(getInterfaceTypeFromValue(value, networkOptions, podNetworkType));
    },
    [setNetworkName, setInterfaceType, networkOptions, podNetworkType],
  );

  // This useEffect is to handle the submit button and init value
  useEffect(() => {
    if (isEditing || networkName) {
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
    isEditing,
  ]);

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
            addOption={(value) =>
              setCreatedNetworkOptions((prev) => [
                ...prev.filter((option) => option.value !== value),
                createNewNetworkOption(value),
              ])
            }
            canCreate
            dataTestId="select-nad"
            getCreateAction={getCreateNetworkOption}
            isFullWidth
            key={`select-nad-${selectedFirstOnLoad}-${loaded}`}
            options={networkOptions}
            placeholder={t('Select a NetworkAttachmentDefinition')}
            selectedValue={networkName}
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
    </FormGroup>
  );
};

export default NetworkInterfaceNetworkSelect;
