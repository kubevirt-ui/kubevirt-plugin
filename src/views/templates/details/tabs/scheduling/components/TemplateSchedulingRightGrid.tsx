import React from 'react';
import { TemplateDetailsGridProps } from 'src/views/templates/details/tabs/details/TemplateDetailsPage';
import DedicatedResources from 'src/views/templates/details/tabs/scheduling/components//DedicatedResources';
import EvictionStrategy from 'src/views/templates/details/tabs/scheduling/components//EvictionStrategy';
import { isCommonVMTemplate } from 'src/views/templates/utils';

import { DescriptionList } from '@patternfly/react-core';

const TemplateSchedulingRightGrid: React.FC<TemplateDetailsGridProps> = ({ template }) => {
  const isTemplateEditable = !isCommonVMTemplate(template);

  return (
    <DescriptionList>
      <DedicatedResources template={template} editable={isTemplateEditable} />
      <EvictionStrategy template={template} editable={isTemplateEditable} />
    </DescriptionList>
  );
};
export default TemplateSchedulingRightGrid;
