import React, { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import SysprepInfo from '@kubevirt-utils/components/SysprepModal/SysprepInfo';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, DescriptionList, Stack, StackItem } from '@patternfly/react-core';

import Loading from '../Loading/Loading';
import VirtualMachineDescriptionItem from '../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

export const SysprepDescription: FC<{
  error?: Error;
  loaded?: boolean;
  selectedSysprepName?: string;
}> = ({ error, loaded, selectedSysprepName }) => {
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
        <DescriptionList
          className="pf-c-description-list"
          columnModifier={{ lg: '1Col', xl: '2Col' }}
          isCompact
        >
          <VirtualMachineDescriptionItem
            descriptionData={
              isEmpty(selectedSysprepName) ? (
                t('Not available')
              ) : (
                <ResourceLink
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
