import React, { FC } from 'react';
import DedicatedResources from 'src/views/templates/details/tabs/scheduling/components//DedicatedResources';
import EvictionStrategy from 'src/views/templates/details/tabs/scheduling/components//EvictionStrategy';

import { updateTemplate } from '@kubevirt-utils/resources/template';
import { DescriptionList } from '@patternfly/react-core';

import { TemplateSchedulingGridProps } from './TemplateSchedulingLeftGrid';

const TemplateSchedulingRightGrid: FC<TemplateSchedulingGridProps> = ({ editable, template }) => {
  return (
    <DescriptionList>
      <DedicatedResources editable={editable} onSubmit={updateTemplate} template={template} />
      <EvictionStrategy editable={editable} onSubmit={updateTemplate} template={template} />
    </DescriptionList>
  );
};

export default TemplateSchedulingRightGrid;
