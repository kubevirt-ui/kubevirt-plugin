import React, { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import SysprepInfo from '@kubevirt-utils/components/SysprepModal/SysprepInfo';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, DescriptionList, Stack, StackItem } from '@patternfly/react-core';

import Loading from '../Loading/Loading';
import VirtualMachineDescriptionItem from '../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

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
        <DescriptionList
          className="pf-c-description-list"
          columnModifier={{ lg: '1Col', xl: '2Col' }}
          isCompact
        >
          {selectedSysprepName ? (
            <VirtualMachineDescriptionItem
              descriptionData={
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(ConfigMapModel)}
                  linkTo={false}
                  name={selectedSysprepName}
                />
              }
              descriptionHeader={t('Selected sysprep')}
            />
          ) : (
            <>
              <VirtualMachineDescriptionItem
                descriptionData={hasAutoUnattend ? t('Available') : t('Not available')}
                descriptionHeader={t('Autounattend.xml answer file')}
              />
              <VirtualMachineDescriptionItem
                descriptionData={hasUnattend ? t('Available') : t('Not available')}
                descriptionHeader={t('Unattend.xml answer file')}
              />
            </>
          )}
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};
