import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getEvictionStrategy } from 'src/views/templates/utils/selectors';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Text,
} from '@patternfly/react-core';

const EvictionStrategy: React.FC<TemplateSchedulingGridProps> = ({ template, editable }) => {
  const { t } = useKubevirtTranslation();
  const strategy = getEvictionStrategy(template);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Eviction strategy')}</DescriptionListTerm>
      {/* TODO  edit */}
      <DescriptionListDescription>
        <Text className={editable ? '' : 'text-muted'}>
          {strategy || t('No eviction strategy')}
        </Text>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default EvictionStrategy;
