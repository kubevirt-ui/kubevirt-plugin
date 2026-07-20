import React, { FC } from 'react';

import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid } from '@patternfly/react-core';

type AdvancedViewProps = {
  model: K8sModel;
  onAnnotationsSubmit: (annotations: Record<string, string>) => Promise<K8sResourceCommon | void>;
  onLabelsSubmit: (labels: Record<string, string>) => Promise<K8sResourceCommon | void>;
  resource: K8sResourceCommon;
};

const AdvancedView: FC<AdvancedViewProps> = ({
  model,
  onAnnotationsSubmit,
  onLabelsSubmit,
  resource,
}) => (
  <Grid span={6}>
    <DescriptionList>
      <DescriptionItemLabels
        descriptionHeaderWrapper={(children) => <SearchItem id="labels">{children}</SearchItem>}
        model={model}
        onLabelsSubmit={onLabelsSubmit}
        resource={resource}
      />
      <DescriptionItemAnnotations
        descriptionHeaderWrapper={(children) => (
          <SearchItem id="annotations">{children}</SearchItem>
        )}
        model={model}
        onAnnotationsSubmit={onAnnotationsSubmit}
        resource={resource}
      />
    </DescriptionList>
  </Grid>
);

export default AdvancedView;
