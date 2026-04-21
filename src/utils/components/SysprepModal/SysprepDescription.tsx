import React, { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import SysprepInfo from '@kubevirt-utils/components/SysprepModal/SysprepInfo';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { Alert, AlertVariant, DescriptionList, Stack, StackItem } from '@patternfly/react-core';

import DescriptionItem from '../DescriptionItem/DescriptionItem';
import Loading from '../Loading/Loading';

export const SysprepDescription: FC<{
  cluster?: string;
  error?: Error;
  loaded?: boolean;
  selectedSysprepName?: string;
}> = ({ cluster, error, loaded, selectedSysprepName }) => {
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
          <DescriptionItem
            descriptionData={
              isEmpty(selectedSysprepName) ? (
                t('Not available')
              ) : (
                <MulticlusterResourceLink
                  cluster={cluster}
                  groupVersionKind={modelToGroupVersionKind(ConfigMapModel)}
                  linkTo={false}
                  name={selectedSysprepName}
                />
              )
            }
          />
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};
