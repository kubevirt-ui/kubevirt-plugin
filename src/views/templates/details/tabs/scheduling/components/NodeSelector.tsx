import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getNodeSelector } from 'src/views/templates/utils/selectors';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  Text,
} from '@patternfly/react-core';

const NodeSelector: React.FC<TemplateSchedulingGridProps> = ({ template, editable }) => {
  const { t } = useKubevirtTranslation();
  const nodeSelector = getNodeSelector(template);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Node selector')}</DescriptionListTerm>
      <DescriptionListDescription>
        {/* TODO edit labels */}
        {nodeSelector ? (
          <LabelGroup defaultIsOpen>
            {Object.entries(nodeSelector)?.map(([key, value]) => (
              <Label key={key}>{`${key}=${value}`}</Label>
            ))}
          </LabelGroup>
        ) : (
          <Text className={editable ? '' : 'text-muted'}>{t('No selector')}</Text>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default NodeSelector;
