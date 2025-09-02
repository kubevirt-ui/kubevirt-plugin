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
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getNetworks } from '@kubevirt-utils/resources/vm';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { FormGroup, Label, ValidatedOptions } from '@patternfly/react-core';

import { getNadType, networkNameStartWithPod, podNetworkExists } from '../../utils/helpers';
import useNADsData from '../hooks/useNADsData';

import NetworkSelectHelperPopover from './components/NetworkSelectHelperPopover/NetworkSelectHelperPopover';
import { createNewNetworkOption, getCreateNetworkOption } from './utils';

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
  const vmiNamespace = vm?.metadata?.namespace || namespace;
  const { loaded, loadError, nads } = useNADsData(vmiNamespace);
  const [selectedFirstOnLoad, setSelectedFirstOnLoad] = useState(false);
  const [createdNetworkOptions, setCreatedNetworkOptions] = useState<
    NetworkSelectTypeaheadOptionProps[]
  >([]);

  const currentlyUsedNADsNames = useMemo(
    () => getNetworks(vm)?.map((network) => network?.multus?.networkName),
    [vm],
  );

  const filteredNADs = nads
    ?.filter((nad) => !currentlyUsedNADsNames?.includes(`${getNamespace(nad)}/${getName(nad)}`))
    .filter(
      (nad) =>
        getNamespace(nad) !== vmiNamespace || !currentlyUsedNADsNames?.includes(getName(nad)),
    );

  const hasPodNetwork = useMemo(() => podNetworkExists(vm), [vm]);
  const hasNads = useMemo(() => filteredNADs?.length > 0, [filteredNADs]);
  const isPodNetworkingOptionExists =
    !hasPodNetwork || (isEditing && networkNameStartWithPod(editInitValueNetworkName));

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
              {podNetworkingText} <Label isCompact>{interfaceTypesProxy.masquerade} Binding</Label>
            </>
          ),
          key: podNetworkingText,
        },
        type: interfaceTypesProxy.masquerade,
        value: podNetworkingText,
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
  ]);

  const validated =
    canCreateNetworkInterface || isEditing ? ValidatedOptions.default : ValidatedOptions.error;

  const handleChange = useCallback(
    (value: string) => {
      setNetworkName(value);
      setInterfaceType(
        value === podNetworkingText
          ? interfaceTypesProxy.masquerade
          : networkOptions.find((netOption) => value === netOption?.value)?.type,
      );
    },
    [setNetworkName, setInterfaceType, podNetworkingText, networkOptions],
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
            key={selectedFirstOnLoad ? 'select-nad-with-preselect' : 'select-nad-without-preselect'}
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
