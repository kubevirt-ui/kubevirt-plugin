import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { type NavPageComponentProps } from '@virtualmachines/details/utils/types';

import { printableVMStatus } from '../../../utils';
import SnapshotList from './components/list/SnapshotList';
import TakeSnapshotButton from './components/TakeSnapshotButton/TakeSnapshotButton';
import useSnapshotData from './hooks/useSnapshotData';

import './SnapshotListPage.scss';

const SnapshotListPage: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const { error, loaded, restoresMap, snapshots } = useSnapshotData(vm);

  return (
    <>
      <ListPageHeader title={t('Snapshots')}>
        <TakeSnapshotButton variant="listPageCreateButton" vm={vm} />
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
