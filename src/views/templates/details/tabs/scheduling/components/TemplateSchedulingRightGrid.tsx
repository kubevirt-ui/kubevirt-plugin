import React from 'react';
import DedicatedResources from 'src/views/templates/details/tabs/scheduling/components//DedicatedResources';
import EvictionStrategy from 'src/views/templates/details/tabs/scheduling/components//EvictionStrategy';

import { TemplateModel, V1Template } from '@kubevirt-utils/models';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';

import { TemplateSchedulingGridProps } from './TemplateSchedulingLeftGrid';

const TemplateSchedulingRightGrid: React.FC<TemplateSchedulingGridProps> = ({
  editable,
  template,
}) => {
  const onSubmit = React.useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        data: updatedTemplate,
        model: TemplateModel,
        name: updatedTemplate?.metadata?.name,
        ns: updatedTemplate?.metadata?.namespace,
      }),
    [],
  );

  return (
    <DescriptionList>
      <DedicatedResources editable={editable} onSubmit={onSubmit} template={template} />
      <EvictionStrategy editable={editable} onSubmit={onSubmit} template={template} />
    </DescriptionList>
  );
};

export default TemplateSchedulingRightGrid;
