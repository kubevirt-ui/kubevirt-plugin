import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../../utils';

import SnapshotList from './components/list/SnapshotList';
import SnapshotModal from './components/modal/SnapshotModal';
import useSnapshotData from './hooks/useSnapshotData';

type SnapshotListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const SnapshotListPage: React.FC<SnapshotListPageProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { snapshots, restoresMap, loaded, error } = useSnapshotData(
    vm?.metadata?.name,
    vm?.metadata?.namespace,
  );

  return (
    <>
      <ListPageBody>
        <ListPageCreateButton
          className="list-page-create-button-margin"
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <SnapshotModal vm={vm} isOpen={isOpen} onClose={onClose} />
            ))
          }
        >
          {t('Take snapshot')}
        </ListPageCreateButton>
        <SnapshotList
          snapshots={snapshots}
          restoresMap={restoresMap}
          loaded={loaded}
          error={error}
          isVMRunning={vm?.status?.printableStatus !== printableVMStatus.Stopped}
        />
      </ListPageBody>
    </>
  );
};

export default SnapshotListPage;
