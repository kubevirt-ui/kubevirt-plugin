import React, { Dispatch, FC, SetStateAction, useEffect, useMemo, useRef } from 'react';

import { V1Interface, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SelectTypeahead from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { interfacesTypes } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { FormGroup, Label, ValidatedOptions } from '@patternfly/react-core';

import { getNadType, networkNameStartWithPod, podNetworkExists } from '../../utils/helpers';
import useNADsData from '../hooks/useNADsData';

import NetworkSelectHelperPopover from './components/NetworkSelectHelperPopover/NetworkSelectHelperPopover';

type NetworkInterfaceNetworkSelectProps = {
  editInitValueNetworkName?: string | undefined;
  iface: V1Interface;
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
  iface,
  isEditing,
  namespace,
  networkName,
  setInterfaceType,
  setNetworkName,
  setSubmitDisabled,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { loaded, loadError, nads } = useNADsData(vm?.metadata?.namespace || namespace);

  const selectedFirstOnLoad = useRef(false);

  const hasPodNetwork = useMemo(() => podNetworkExists(vm), [vm]);
  const hasNads = useMemo(() => nads?.length > 0, [nads]);
  const isPodNetworkingOptionExists =
    !hasPodNetwork || (isEditing && networkNameStartWithPod(editInitValueNetworkName));

  const canCreateNetworkInterface = useMemo(
    () => hasNads || !hasPodNetwork,
    [hasNads, hasPodNetwork],
  );

  const podNetworkingText = useMemo(() => t('Pod Networking'), [t]);

  const networkOptions = useMemo(() => {
    const options = nads?.map((nad) => {
      const { name, namespace: nadNamespace, uid } = nad?.metadata;
      const type = getNadType(nad);
      const value = `${nadNamespace}/${name}`;
      return {
        children: (
          <>
            {value} <Label isCompact>{getNadType(nad)} Binding</Label>
          </>
        ),
        key: uid,
        type,
        value,
      };
    });

    if (isPodNetworkingOptionExists) {
      options.unshift({
        children: (
          <>
            {podNetworkingText} <Label isCompact>{interfacesTypes.bridge} Binding</Label>
          </>
        ),
        key: 'pod-networking',
        type: interfacesTypes.bridge,
        value: podNetworkingText,
      });
    }
    return options;
  }, [isPodNetworkingOptionExists, nads, podNetworkingText]);

  useEffect(() => {
    if (!loaded) return;

    const initialInterfaceType = interfacesTypes[getNetworkInterfaceType(iface)];

    if (!initialInterfaceType) return;

    setInterfaceType(initialInterfaceType);
  }, [loaded, nads, setInterfaceType, iface]);

  const validated =
    canCreateNetworkInterface || isEditing ? ValidatedOptions.default : ValidatedOptions.error;

  const handleChange = (value: string) => {
    setNetworkName(value);
    setInterfaceType(
      value === podNetworkingText
        ? interfacesTypes.masquerade
        : networkOptions.find((netOption) => value === netOption?.value)?.type,
    );
  };

  // This useEffect is to handle the submit button and init value
  useEffect(() => {
    // if networkName exists, we have the option to create a NIC either with pod networking or by existing NAD
    if (networkName) {
      setSubmitDisabled(false);
      return;
    }

    // if networkName is empty, and pod network exists we can create a NIC with existing NAD if there is one
    if (loaded && !loadError && !selectedFirstOnLoad.current) {
      setNetworkName(networkOptions?.[0]?.value);
      selectedFirstOnLoad.current = true;

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
    setNetworkName,
    setSubmitDisabled,
  ]);

  return (
    <FormGroup
      fieldId="network-attachment-definition"
      isRequired
      label={t('Network')}
      labelIcon={<NetworkSelectHelperPopover />}
    >
      <div data-test-id="network-attachment-definition-select">
        {hasPodNetwork && !loaded ? (
          <Loading />
        ) : (
          <SelectTypeahead
            getCreateOption={(inputValue) => (
              <>
                {t(`Use "{{inputValue}}"`, { inputValue })}{' '}
                <Label isCompact>{interfacesTypes.bridge} Binding</Label>
              </>
            )}
            dataTestId="select-nad"
            initialOptions={networkOptions}
            isFullWidth
            placeholder={t('Select a NetworkAttachmentDefinitions')}
            selected={networkName}
            setSelected={handleChange}
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
