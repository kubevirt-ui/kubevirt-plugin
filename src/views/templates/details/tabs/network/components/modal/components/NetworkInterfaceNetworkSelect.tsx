import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  ValidatedOptions,
} from '@patternfly/react-core';

import { interfaceTypeTypes } from '../utils/constants';
import { networkNameStartWithPod, podNetworkExists } from '../utils/helpers';

type NetworkInterfaceNetworkSelectProps = {
  template: V1Template;
  networkName: string;
  setNetworkName: React.Dispatch<React.SetStateAction<string>>;
  setInterfaceType: React.Dispatch<React.SetStateAction<string>>;
  setSubmitDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  isEditing?: boolean | undefined;
  editInitValueNetworkName?: string | undefined;
};

const NetworkInterfaceNetworkSelect: React.FC<NetworkInterfaceNetworkSelectProps> = ({
  template,
  networkName,
  setNetworkName,
  setInterfaceType,
  setSubmitDisabled,
  isEditing,
  editInitValueNetworkName,
}) => {
  const vm = getTemplateVirtualMachineObject(template);
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const [nads, loaded, error] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
    namespace: template?.metadata?.namespace,
  });

  const hasPodNetwork = React.useMemo(() => podNetworkExists(vm), [vm]);
  const hasNads = React.useMemo(() => nads && nads.length > 0, [nads]);
  const isPodNetworkingOptionExists =
    !hasPodNetwork || (isEditing && networkNameStartWithPod(editInitValueNetworkName));

  const canCreateNetworkInterface = React.useMemo(
    () => hasNads || !hasPodNetwork,
    [hasNads, hasPodNetwork],
  );

  const podNetworkingText = React.useMemo(() => t('Pod Networking'), [t]);

  const networkOptions = React.useMemo(() => {
    const options = nads?.map(({ metadata }) => ({ key: metadata?.uid, value: metadata?.name }));
    if (isPodNetworkingOptionExists) {
      options.unshift({ key: 'pod-networking', value: podNetworkingText });
    }
    return options;
  }, [isPodNetworkingOptionExists, nads, podNetworkingText]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    setNetworkName(value);
    setInterfaceType(
      value === podNetworkingText ? interfaceTypeTypes.MASQUERADE : interfaceTypeTypes.BRIDGE,
    );
    setIsOpen(false);
  };

  // This useEffect is to handle the submit button and init value
  React.useEffect(() => {
    // if networkName exists, we have the option to create a NIC either with pod networking or by existing NAD
    if (networkName) {
      setSubmitDisabled(false);
    }
    // if networkName is empty, and no pod network exists we can create a NIC with pod networking
    else if (!hasPodNetwork) {
      setNetworkName(podNetworkingText);
    }
    // if networkName is empty, and pod network exists we can create a NIC with existing NAD if there is one
    else if (loaded && !error && hasNads) {
      setNetworkName(nads[0].metadata.name);
    }
    // if no nads and pod network already exists, we can't create a NIC
    else if (loaded && (error || !canCreateNetworkInterface)) {
      setSubmitDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    error,
    canCreateNetworkInterface,
    loaded,
    networkName,
    nads,
    hasNads,
    hasPodNetwork,
    podNetworkingText,
  ]);

  return (
    <FormGroup
      helperTextInvalid={
        loaded &&
        t(
          'No NetworkAttachmentDefinitions available. Contact your system administrator for additional support.',
        )
      }
      label={t('Network')}
      fieldId="network-attachment-definition"
      validated={
        canCreateNetworkInterface || isEditing ? ValidatedOptions.default : ValidatedOptions.error
      }
      isRequired
    >
      {hasPodNetwork && !loaded ? (
        <Loading />
      ) : (
        <Select
          menuAppendTo="parent"
          isDisabled={!canCreateNetworkInterface}
          onToggle={setIsOpen}
          isOpen={isOpen}
          onSelect={handleChange}
          variant={SelectVariant.single}
          selections={networkName}
        >
          {networkOptions?.map(({ key, value }) => (
            <SelectOption key={key} value={value} />
          ))}
        </Select>
      )}
    </FormGroup>
  );
};

export default NetworkInterfaceNetworkSelect;
