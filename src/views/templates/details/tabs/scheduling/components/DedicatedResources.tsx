import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { isDedicatedCPUPlacement } from 'src/views/templates/utils';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Text,
} from '@patternfly/react-core';

const DedicatedResources: React.FC<TemplateSchedulingGridProps> = ({ template, editable }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Dedicated resources')}</DescriptionListTerm>
      {/* TODO edit */}
      <DescriptionListDescription>
        <Text className={editable ? '' : 'text-muted'}>
          {isDedicatedCPUPlacement(template)
            ? t('Workload scheduled with dedicated resources (guaranteed policy)')
            : t('No Dedicated resources applied')}
        </Text>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default DedicatedResources;
