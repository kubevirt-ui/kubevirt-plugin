import React, { type FC } from 'react';

import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';

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
        <ListEmptyState
          bodyContent={t('To get started, add a bootable volume.')}
          buttonAction={<BootableVolumeAddButton namespace={namespace} />}
          titleText={t("You don't have any bootable volumes yet")}
        />
      </ListPageBody>
    </>
  );
};

export default BootableVolumesEmptyState;
