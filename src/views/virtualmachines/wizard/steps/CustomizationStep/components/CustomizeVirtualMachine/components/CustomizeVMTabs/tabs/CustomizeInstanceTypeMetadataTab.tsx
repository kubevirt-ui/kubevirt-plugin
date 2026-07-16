import React, { FC, useCallback } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import {
  customizeWizardVMSignal,
  patchCustomizeWizardVMSignal,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { PageSection } from '@patternfly/react-core';

import MetadataTabContent from '@virtualmachines/details/tabs/configuration/metadata/components/MetadataTabContent';

import '@virtualmachines/details/tabs/configuration/metadata/metadata-tab.scss';

const CustomizeInstanceTypeMetadataTab: FC = () => {
  const vm = customizeWizardVMSignal.value;

  const updateMetadata = useCallback(
    (data: Record<string, string>, type: string) =>
      Promise.resolve(patchCustomizeWizardVMSignal([{ data, path: `metadata.${type}` }])),
    [],
  );

  const onLabelsSubmit = useCallback(
    (labels: Record<string, string>) => updateMetadata(labels, 'labels'),
    [updateMetadata],
  );

  const onAnnotationsSubmit = useCallback(
    (annotations: Record<string, string>) => updateMetadata(annotations, 'annotations'),
    [updateMetadata],
  );

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <MetadataTabContent
        onAnnotationsSubmit={onAnnotationsSubmit}
        onLabelsSubmit={onLabelsSubmit}
        vm={vm}
      />
    </PageSection>
  );
};

export default CustomizeInstanceTypeMetadataTab;
