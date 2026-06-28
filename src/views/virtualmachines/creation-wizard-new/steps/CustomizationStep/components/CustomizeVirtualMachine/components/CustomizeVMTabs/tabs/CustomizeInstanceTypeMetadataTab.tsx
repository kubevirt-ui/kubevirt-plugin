import React from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
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

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="metadata">{t('Metadata')}</SearchItem>
      </Title>
      <Grid span={6}>
        <DescriptionList>
          <DescriptionItemLabels
            onLabelsSubmit={(labels) =>
              Promise.resolve(
                updateCustomizeInstanceType([{ data: labels, path: 'metadata.labels' }]),
              )
            }
            descriptionHeaderWrapper={(children) => <SearchItem id="labels">{children}</SearchItem>}
            model={VirtualMachineModel}
            resource={vm}
          />
          <DescriptionItemAnnotations
            descriptionHeaderWrapper={(children) => (
              <SearchItem id="annotations">{children}</SearchItem>
            )}
            onAnnotationsSubmit={(annotations) =>
              Promise.resolve(
                updateCustomizeInstanceType([{ data: annotations, path: 'metadata.annotations' }]),
              )
            }
            model={VirtualMachineModel}
            resource={vm}
          />
        </DescriptionList>
      </Grid>
    </PageSection>
  );
};

export default CustomizeInstanceTypeMetadataTab;
