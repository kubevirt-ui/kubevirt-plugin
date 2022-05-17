import React from 'react';
import DedicatedResources from 'src/views/templates/details/tabs/scheduling/components//DedicatedResources';
import EvictionStrategy from 'src/views/templates/details/tabs/scheduling/components//EvictionStrategy';

import { TemplateModel, V1Template } from '@kubevirt-utils/models';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';

import { TemplateSchedulingGridProps } from './TemplateSchedulingLeftGrid';

const TemplateSchedulingRightGrid: React.FC<TemplateSchedulingGridProps> = ({
  template,
  editable,
}) => {
  const onSubmit = React.useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        model: TemplateModel,
        data: updatedTemplate,
        ns: updatedTemplate?.metadata?.namespace,
        name: updatedTemplate?.metadata?.name,
      }),
    [],
  );

  return (
    <DescriptionList>
      <DedicatedResources template={template} editable={editable} onSubmit={onSubmit} />
      <EvictionStrategy template={template} editable={editable} onSubmit={onSubmit} />
    </DescriptionList>
  );
};

export default TemplateSchedulingRightGrid;
