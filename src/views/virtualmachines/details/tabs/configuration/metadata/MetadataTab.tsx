import React, { FC } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Grid, PageSection, Title } from '@patternfly/react-core';

import { updateAnnotation, updateLabels } from '../details/utils/utils';
import { ConfigurationInnerTabProps } from '../utils/types';

const MetadataTab: FC<ConfigurationInnerTabProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

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
            onLabelsSubmit={(labels) => updateLabels(vm, labels)}
            resource={vm}
          />
          <DescriptionItemAnnotations
            descriptionHeaderWrapper={(children) => (
              <SearchItem id="metadata">{children}</SearchItem>
            )}
            model={VirtualMachineModel}
            onAnnotationsSubmit={(annotations) => updateAnnotation(vm, annotations)}
            resource={vm}
          />
        </DescriptionList>
      </Grid>
    </PageSection>
  );
};

export default MetadataTab;
