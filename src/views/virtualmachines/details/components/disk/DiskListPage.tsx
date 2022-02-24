import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import DiskList from './DiskList';

type DiskListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const DiskListPage: React.FC<DiskListPageProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton>{t('Add disk')}</ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <DiskList vm={obj} />
      </ListPageBody>
    </>
  );
};

export default DiskListPage;
