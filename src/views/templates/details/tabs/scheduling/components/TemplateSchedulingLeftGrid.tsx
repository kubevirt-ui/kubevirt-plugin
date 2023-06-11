import React from 'react';
import AffinityRules from 'src/views/templates/details/tabs/scheduling/components/AffinityRules';
import Descheduler from 'src/views/templates/details/tabs/scheduling/components/Descheduler';
import NodeSelector from 'src/views/templates/details/tabs/scheduling/components/NodeSelector';
import Tolerations from 'src/views/templates/details/tabs/scheduling/components/Tolerations';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';

export type TemplateSchedulingGridProps = {
  editable: boolean;
  onSubmit?: (updatedTemplate: V1Template) => Promise<V1Template | void>;
  template: V1Template;
};

const TemplateSchedulingLeftGrid: React.FC<TemplateSchedulingGridProps> = ({
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
      <NodeSelector editable={editable} onSubmit={onSubmit} template={template} />
      <Tolerations editable={editable} onSubmit={onSubmit} template={template} />
      <AffinityRules editable={editable} onSubmit={onSubmit} template={template} />
      <Descheduler template={template} />
    </DescriptionList>
  );
};

export default TemplateSchedulingLeftGrid;
