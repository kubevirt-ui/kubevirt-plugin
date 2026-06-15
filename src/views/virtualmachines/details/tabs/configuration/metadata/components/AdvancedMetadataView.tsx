import React, { FC } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { DescriptionList, Grid } from '@patternfly/react-core';

import { updateAnnotation, updateLabels } from '../../details/utils/utils';

type AdvancedMetadataViewProps = {
  canUpdate: boolean;
  onEditAnnotations: () => void;
  onEditLabels: () => void;
  vm: V1VirtualMachine;
};

const AdvancedMetadataView: FC<AdvancedMetadataViewProps> = ({
  canUpdate,
  onEditAnnotations,
  onEditLabels,
  vm,
}) => (
  <Grid span={6}>
    <DescriptionList>
      <DescriptionItemLabels
        descriptionHeaderWrapper={(children) => <SearchItem id="labels">{children}</SearchItem>}
        editable={canUpdate}
        model={VirtualMachineModel}
        onEditClick={onEditLabels}
        onLabelsSubmit={(labels) => updateLabels(vm, labels)}
        resource={vm}
      />
      <DescriptionItemAnnotations
        descriptionHeaderWrapper={(children) => (
          <SearchItem id="annotations">{children}</SearchItem>
        )}
        editable={canUpdate}
        model={VirtualMachineModel}
        onAnnotationsSubmit={(annotations) => updateAnnotation(vm, annotations)}
        onEditClick={onEditAnnotations}
        resource={vm}
      />
    </DescriptionList>
  </Grid>
);

export default AdvancedMetadataView;
