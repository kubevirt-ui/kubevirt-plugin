import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import SnapshotList from './SnapshotList';

type SnapshotListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const SnapshotListPage: React.FC<SnapshotListPageProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton>{t('Add snapshot')}</ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <SnapshotList vm={obj} />
      </ListPageBody>
    </>
  );
};

export default SnapshotListPage;
