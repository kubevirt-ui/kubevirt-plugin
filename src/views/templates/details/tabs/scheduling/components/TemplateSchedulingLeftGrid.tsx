import React from 'react';
import { TemplateDetailsGridProps } from 'src/views/templates/details/tabs/details/TemplateDetailsPage';
import AffinityRules from 'src/views/templates/details/tabs/scheduling/components/AffinityRules';
import NodeSelector from 'src/views/templates/details/tabs/scheduling/components/NodeSelector';
import Tolerations from 'src/views/templates/details/tabs/scheduling/components/Tolerations';
import { isCommonVMTemplate } from 'src/views/templates/utils';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { DescriptionList } from '@patternfly/react-core';

export type TemplateSchedulingGridProps = {
  template: V1Template;
  editable: boolean;
};

const TemplateSchedulingLeftGrid: React.FC<TemplateDetailsGridProps> = ({ template }) => {
  const isTemplateEditable = !isCommonVMTemplate(template);

  return (
    <DescriptionList>
      <NodeSelector template={template} editable={isTemplateEditable} />
      <Tolerations template={template} editable={isTemplateEditable} />
      <AffinityRules template={template} editable={isTemplateEditable} />
      {/* TODO Descheduler */}
    </DescriptionList>
  );
};

export default TemplateSchedulingLeftGrid;
