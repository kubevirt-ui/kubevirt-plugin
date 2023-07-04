import React, { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import SysprepInfo from '@kubevirt-utils/components/SysprepModal/SysprepInfo';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
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

import Loading from '../Loading/Loading';

export const SysprepDescription: FC<{
  error?: Error;
  hasAutoUnattend: boolean;
  hasUnattend: boolean;
  loaded?: boolean;
  selectedSysprepName?: string;
}> = ({ error, hasAutoUnattend, hasUnattend, loaded, selectedSysprepName }) => {
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
          {selectedSysprepName ? (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Selected sysprep')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(ConfigMapModel)}
                  linkTo={false}
                  name={selectedSysprepName}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : (
            <>
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
            </>
          )}
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};
