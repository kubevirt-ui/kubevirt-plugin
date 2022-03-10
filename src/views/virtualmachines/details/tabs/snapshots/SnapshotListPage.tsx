import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import SnapshotList from './components/list/SnapshotList';
import SnapshotModal from './components/modal/SnapshotModal';
import useSnapshotData from './hooks/useSnapshotData';
import { getUsedSnapshotNames } from './utils/selectors';

type SnapshotListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const SnapshotListPage: React.FC<SnapshotListPageProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const { snapshots, restoresMap, loaded, error } = useSnapshotData(
    obj?.metadata?.name,
    obj?.metadata?.namespace,
  );

  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton onClick={() => setIsOpen(true)}>
          {t('Add snapshot')}
        </ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <SnapshotList
          snapshots={snapshots}
          restoresMap={restoresMap}
          loaded={loaded}
          error={error}
        />
      </ListPageBody>
      {isOpen && (
        <SnapshotModal
          usedNames={getUsedSnapshotNames(snapshots)}
          vm={obj}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default SnapshotListPage;
