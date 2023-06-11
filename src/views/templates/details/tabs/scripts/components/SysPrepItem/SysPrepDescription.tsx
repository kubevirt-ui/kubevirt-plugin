import React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import SysprepInfo from '@kubevirt-utils/components/SysprepModal/SysprepInfo';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';

export const SysprepDescription: React.FC<{
  error: Error;
  hasAutoUnattend: boolean;
  hasUnattend: boolean;
  loaded: boolean;
}> = ({ error, hasAutoUnattend, hasUnattend, loaded }) => {
  const { t } = useKubevirtTranslation();

  if (error) {
    return (
      <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
        {error?.message}
      </Alert>
    );
  }

  if (!loaded) {
    return <Loading />;
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <SysprepInfo />
      </StackItem>
      <StackItem>
        <DescriptionList columnModifier={{ lg: '1Col', xl: '2Col' }} isCompact>
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
