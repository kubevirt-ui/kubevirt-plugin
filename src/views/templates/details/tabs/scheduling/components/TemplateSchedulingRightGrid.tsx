import React from 'react';
import DedicatedResources from 'src/views/templates/details/tabs/scheduling/components//DedicatedResources';
import EvictionStrategy from 'src/views/templates/details/tabs/scheduling/components//EvictionStrategy';

import { DescriptionList } from '@patternfly/react-core';

import { TemplateSchedulingGridProps } from './TemplateSchedulingLeftGrid';

const TemplateSchedulingRightGrid: React.FC<TemplateSchedulingGridProps> = ({
  template,
  editable,
}) => {
  return (
    <DescriptionList>
      <DedicatedResources template={template} editable={editable} />
      <EvictionStrategy template={template} editable={editable} />
    </DescriptionList>
  );
};
export default TemplateSchedulingRightGrid;
