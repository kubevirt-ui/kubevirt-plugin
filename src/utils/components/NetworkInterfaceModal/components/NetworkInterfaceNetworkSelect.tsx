import React, { Dispatch, FC, MouseEvent, SetStateAction, useEffect, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { interfacesTypes } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { FormGroup, SelectList, SelectOption, ValidatedOptions } from '@patternfly/react-core';

import { getNadType, networkNameStartWithPod, podNetworkExists } from '../utils/helpers';

import useNADsData from './hooks/useNADsData';

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
  const { loaded, loadError, nads } = useNADsData(vm?.metadata?.namespace || namespace);

  const hasPodNetwork = useMemo(() => podNetworkExists(vm), [vm]);
  const hasNads = useMemo(() => nads && nads.length > 0, [nads]);
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
      return {
        key: uid,
        type: getNadType(nad),
        value: `${nadNamespace}/${name}`,
      };
    });
    if (isPodNetworkingOptionExists) {
      options.unshift({
        key: 'pod-networking',
        type: interfacesTypes.bridge,
        value: podNetworkingText,
      });
    }
    return options;
  }, [isPodNetworkingOptionExists, nads, podNetworkingText]);

  useEffect(() => {
    loaded && setInterfaceType(getNadType(nads?.[0]));
  }, [loaded, nads, setInterfaceType]);

  const validated =
    canCreateNetworkInterface || isEditing ? ValidatedOptions.default : ValidatedOptions.error;

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
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
    }
    // if networkName is empty, and pod network exists we can create a NIC with existing NAD if there is one
    else if (loaded && !loadError) {
      setNetworkName(networkOptions?.[0]?.value);
    }
    // if no nads and pod network already exists, we can't create a NIC
    else if (loaded && (loadError || !canCreateNetworkInterface)) {
      setSubmitDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loadError,
    canCreateNetworkInterface,
    loaded,
    networkName,
    nads,
    hasNads,
    hasPodNetwork,
    podNetworkingText,
  ]);

  return (
    <FormGroup fieldId="network-attachment-definition" isRequired label={t('Network')}>
      <div data-test-id="network-attachment-definition-select">
        {hasPodNetwork && !loaded ? (
          <Loading />
        ) : (
          <FormPFSelect
            onSelect={handleChange}
            selected={networkName}
            toggleProps={{ isDisabled: !canCreateNetworkInterface, isFullWidth: true }}
          >
            <SelectList>
              {networkOptions?.map(({ key, value }) => (
                <SelectOption
                  data-test-id={`network-attachment-definition-select-${key}`}
                  key={key}
                  value={value}
                >
                  {value}
                </SelectOption>
              ))}
            </SelectList>
          </FormPFSelect>
        )}
      </div>
      <FormGroupHelperText validated={validated}>
        {loaded &&
          validated === ValidatedOptions.error &&
          t(
            'No NetworkAttachmentDefinitions available. Contact your system administrator for additional support.',
          )}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default NetworkInterfaceNetworkSelect;
