import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getTolerations } from 'src/views/templates/utils/selectors';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  Text,
} from '@patternfly/react-core';

const Tolerations: React.FC<TemplateSchedulingGridProps> = ({ template, editable }) => {
  const { t } = useKubevirtTranslation();
  const tolerations = getTolerations(template);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Tolerations')}</DescriptionListTerm>
      <DescriptionListDescription>
        {/* TODO edit labels */}
        {tolerations ? (
          <LabelGroup defaultIsOpen>
            {Object.entries(tolerations)?.map(([key, value]) => (
              <Label key={key}>{`${key}=${value}`}</Label>
            ))}
          </LabelGroup>
        ) : (
          <Text className={editable ? '' : 'text-muted'}>{t(' 0 Toleration rules')}</Text>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Tolerations;
