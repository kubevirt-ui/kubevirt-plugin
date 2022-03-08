import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceList from './NetworkInterfaceList';

type NetworkInterfaceListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const NetworkInterfaceListPage: React.FC<NetworkInterfaceListPageProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton>{t('Add network interface')}</ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <NetworkInterfaceList vm={obj} />
      </ListPageBody>
    </>
  );
};

export default NetworkInterfaceListPage;
