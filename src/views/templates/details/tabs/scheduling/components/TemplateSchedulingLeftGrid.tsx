import React, { FC } from 'react';
import AffinityRules from 'src/views/templates/details/tabs/scheduling/components/AffinityRules';
import Descheduler from 'src/views/templates/details/tabs/scheduling/components/Descheduler';
import NodeSelector from 'src/views/templates/details/tabs/scheduling/components/NodeSelector';
import Tolerations from 'src/views/templates/details/tabs/scheduling/components/Tolerations';

import { Template, updateTemplate } from '@kubevirt-utils/resources/template';
import { DescriptionList } from '@patternfly/react-core';

export type TemplateSchedulingGridProps = {
  editable: boolean;
  onSubmit?: (updatedTemplate: Template) => Promise<Template | void>;
  template: Template;
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
