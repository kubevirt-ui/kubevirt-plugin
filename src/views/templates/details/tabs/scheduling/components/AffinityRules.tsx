import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getAffinity } from 'src/views/templates/utils/selectors';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Text,
} from '@patternfly/react-core';

const AffinityRules: React.FC<TemplateSchedulingGridProps> = ({ template, editable }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Affinity rules')}</DescriptionListTerm>
      <DescriptionListDescription>
        <Text className={editable ? '' : 'text-muted'}>
          {/* TODO edit rules */}
          {t('{{rulesCount}} Affinity rules', {
            rulesCount: getAffinity(template).length,
          })}
        </Text>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default AffinityRules;
