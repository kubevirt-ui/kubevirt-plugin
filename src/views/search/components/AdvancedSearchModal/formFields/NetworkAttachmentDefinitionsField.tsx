import React, { Dispatch, FC, SetStateAction, useMemo } from 'react';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { NetworkAttachmentDefinition } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup } from '@patternfly/react-core';

type NetworkAttachmentDefinitionsFieldProps = {
  networkAttachmentDefinitions: string[];
  setNetworkAttachmentDefinitions: Dispatch<SetStateAction<string[]>>;
};

const NetworkAttachmentDefinitionsField: FC<NetworkAttachmentDefinitionsFieldProps> = ({
  networkAttachmentDefinitions,
  setNetworkAttachmentDefinitions,
}) => {
  const { t } = useKubevirtTranslation();

  const [allNetworkAttachmentDefinitions] = useK8sWatchResource<NetworkAttachmentDefinition[]>({
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
  });

  const allOptions = useMemo(() => {
    return allNetworkAttachmentDefinitions?.map((nad) => `${getNamespace(nad)}/${getName(nad)}`);
  }, [allNetworkAttachmentDefinitions]);

  const placeholder = t('Find by name');

  return (
    <FormGroup label={t('Network Attachment Definitions')}>
      <MultiSelectTypeahead
        allResourceNames={allOptions}
        data-test="adv-search-vm-nad"
        emptyValuePlaceholder={placeholder}
        selectedResourceNames={networkAttachmentDefinitions}
        selectPlaceholder={placeholder}
        setSelectedResourceNames={setNetworkAttachmentDefinitions}
      />
    </FormGroup>
  );
};

export default NetworkAttachmentDefinitionsField;
