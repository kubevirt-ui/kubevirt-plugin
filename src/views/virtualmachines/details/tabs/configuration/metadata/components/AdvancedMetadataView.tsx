import React, { FC, useCallback } from 'react';

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
}) => {
  const onLabelsSubmit = useCallback((labels) => updateLabels(vm, labels), [vm]);
  const onAnnotationsSubmit = useCallback((annotations) => updateAnnotation(vm, annotations), [vm]);

  return (
    <Grid span={6}>
      <DescriptionList>
        <DescriptionItemLabels
          descriptionHeaderWrapper={(children) => <SearchItem id="labels">{children}</SearchItem>}
          editable={canUpdate}
          model={VirtualMachineModel}
          onEditClick={onEditLabels}
          onLabelsSubmit={onLabelsSubmit}
          resource={vm}
        />
        <DescriptionItemAnnotations
          descriptionHeaderWrapper={(children) => (
            <SearchItem id="annotations">{children}</SearchItem>
          )}
          editable={canUpdate}
          model={VirtualMachineModel}
          onAnnotationsSubmit={onAnnotationsSubmit}
          onEditClick={onEditAnnotations}
          resource={vm}
        />
      </DescriptionList>
    </Grid>
  );
};

export default AdvancedMetadataView;
