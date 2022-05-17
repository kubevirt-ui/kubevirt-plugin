import React from 'react';
import AffinityRules from 'src/views/templates/details/tabs/scheduling/components/AffinityRules';
import Descheduler from 'src/views/templates/details/tabs/scheduling/components/Descheduler';
import NodeSelector from 'src/views/templates/details/tabs/scheduling/components/NodeSelector';
import Tolerations from 'src/views/templates/details/tabs/scheduling/components/Tolerations';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';

export type TemplateSchedulingGridProps = {
  template: V1Template;
  editable: boolean;
  onSubmit?: (updatedTemplate: V1Template) => Promise<V1Template | void>;
};

const TemplateSchedulingLeftGrid: React.FC<TemplateSchedulingGridProps> = ({
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
      <NodeSelector template={template} editable={editable} onSubmit={onSubmit} />
      <Tolerations template={template} editable={editable} onSubmit={onSubmit} />
      <AffinityRules template={template} editable={editable} onSubmit={onSubmit} />
      <Descheduler template={template} />
    </DescriptionList>
  );
};

export default TemplateSchedulingLeftGrid;
