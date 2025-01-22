import React, { FC } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SnapshotModal from '@kubevirt-utils/components/SnapshotModal/SnapshotModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import { printableVMStatus } from '../../../utils';

import SnapshotList from './components/list/SnapshotList';
import useSnapshotData from './hooks/useSnapshotData';

import './SnapshotListPage.scss';

const SnapshotListPage: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { error, loaded, restoresMap, snapshots } = useSnapshotData(
    vm?.metadata?.name,
    vm?.metadata?.namespace,
  );

  return (
    <>
      <ListPageHeader title={t('Snapshots')}>
        <ListPageCreateButton
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <SnapshotModal isOpen={isOpen} onClose={onClose} vm={vm} />
            ))
          }
          className="list-page-create-button-margin"
        >
          {t('Take snapshot')}
        </ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <SnapshotList
          error={error}
          isVMRunning={vm?.status?.printableStatus !== printableVMStatus.Stopped}
          loaded={loaded}
          restoresMap={restoresMap}
          snapshots={snapshots}
        />
      </ListPageBody>
    </>
  );
};

export default SnapshotListPage;
