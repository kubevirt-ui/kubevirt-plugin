import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

import BootableVolumeAddButton from './BootableVolumeAddButton';

type BootableVolumesEmptyStateProps = {
  namespace: string;
};

const BootableVolumesEmptyState: FC<BootableVolumesEmptyStateProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader title={t('Bootable volumes')} />

      <ListPageBody>
        <EmptyState variant={EmptyStateVariant.lg}>
          <EmptyStateHeader
            headingLevel="h4"
            icon={<EmptyStateIcon icon={AddCircleOIcon} />}
            titleText={<>{t('No bootable volumes found')}</>}
          />

          <EmptyStateBody>
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              Click <b>Add bootable volume</b> to add your first bootable volume
            </Trans>
          </EmptyStateBody>

          <EmptyStateFooter>
            <EmptyStateActions>
              <BootableVolumeAddButton
                buttonText={t('Add bootable volume')}
                namespace={namespace}
              />
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </ListPageBody>
    </>
  );
};

export default BootableVolumesEmptyState;
