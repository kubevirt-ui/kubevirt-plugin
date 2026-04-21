import React, { FC } from 'react';
import AffinityRules from 'src/views/templates/details/tabs/scheduling/components/AffinityRules';
import Descheduler from 'src/views/templates/details/tabs/scheduling/components/Descheduler';
import NodeSelector from 'src/views/templates/details/tabs/scheduling/components/NodeSelector';
import Tolerations from 'src/views/templates/details/tabs/scheduling/components/Tolerations';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { updateTemplate } from '@kubevirt-utils/resources/template';
import { DescriptionList } from '@patternfly/react-core';

export type TemplateSchedulingGridProps = {
  editable: boolean;
  onSubmit?: (updatedTemplate: V1Template) => Promise<V1Template | void>;
  template: V1Template;
};

const TemplateSchedulingLeftGrid: FC<TemplateSchedulingGridProps> = ({ editable, template }) => {
  return (
    <DescriptionList>
      <NodeSelector editable={editable} onSubmit={updateTemplate} template={template} />
      <Tolerations editable={editable} onSubmit={updateTemplate} template={template} />
      <AffinityRules editable={editable} onSubmit={updateTemplate} template={template} />
      <Descheduler template={template} />
    </DescriptionList>
  );
};

export default TemplateSchedulingLeftGrid;
