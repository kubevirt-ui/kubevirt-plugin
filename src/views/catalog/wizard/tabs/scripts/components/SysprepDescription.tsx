import React from 'react';

import SysprepInfo from '@kubevirt-utils/components/SysprepModal/SysprepInfo';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';

export const SysprepDescription: React.FC<{ hasAutoUnattend: boolean; hasUnattend: boolean }> = ({
  hasAutoUnattend,
  hasUnattend,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <SysprepInfo />
      </StackItem>
      <StackItem>
        <DescriptionList isCompact columnModifier={{ lg: '1Col', xl: '2Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Autounattend.xml answer file')}</DescriptionListTerm>
            <DescriptionListDescription>
              {hasAutoUnattend ? t('Available') : t('Not available')}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Unattend.xml answer file')}</DescriptionListTerm>
            {hasUnattend ? t('Available') : t('Not available')}
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};
