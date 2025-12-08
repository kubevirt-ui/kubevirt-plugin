import React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { DescriptionList, Grid, PageSection, Title } from '@patternfly/react-core';

const CustomizeInstanceTypeMetadataTab = () => {
  const { t } = useKubevirtTranslation();
  const vm = vmSignal.value;

  if (!vm) {
    return <Loading />;
  }

  const updateMetadata = (data: { [key: string]: string }, type: string) =>
    Promise.resolve(
      updateCustomizeInstanceType([
        {
          data,
          path: `metadata.${type}`,
        },
      ]),
    );

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="metadata">{t('Metadata')}</SearchItem>
      </Title>
      <Grid span={6}>
        <DescriptionList>
          <DescriptionItemLabels
            descriptionHeaderWrapper={(children) => <SearchItem id="labels">{children}</SearchItem>}
            model={VirtualMachineModel}
            onLabelsSubmit={(labels) => updateMetadata(labels, 'labels')}
            resource={vm}
          />
          <DescriptionItemAnnotations
            descriptionHeaderWrapper={(children) => (
              <SearchItem id="metadata">{children}</SearchItem>
            )}
            model={VirtualMachineModel}
            onAnnotationsSubmit={(annotations) => updateMetadata(annotations, 'annotations')}
            resource={vm}
          />
        </DescriptionList>
      </Grid>
    </PageSection>
  );
};

export default CustomizeInstanceTypeMetadataTab;
