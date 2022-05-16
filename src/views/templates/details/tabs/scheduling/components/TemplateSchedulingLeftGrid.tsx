import React from 'react';
import AffinityRules from 'src/views/templates/details/tabs/scheduling/components/AffinityRules';
import Descheduler from 'src/views/templates/details/tabs/scheduling/components/Descheduler';
import NodeSelector from 'src/views/templates/details/tabs/scheduling/components/NodeSelector';
import Tolerations from 'src/views/templates/details/tabs/scheduling/components/Tolerations';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { DescriptionList } from '@patternfly/react-core';

export type TemplateSchedulingGridProps = {
  template: V1Template;
  editable: boolean;
};

const TemplateSchedulingLeftGrid: React.FC<TemplateSchedulingGridProps> = ({
  template,
  editable,
}) => {
  return (
    <DescriptionList>
      <NodeSelector template={template} editable={editable} />
      <Tolerations template={template} editable={editable} />
      <AffinityRules template={template} editable={editable} />
      <Descheduler template={template} />
    </DescriptionList>
  );
};

export default TemplateSchedulingLeftGrid;
