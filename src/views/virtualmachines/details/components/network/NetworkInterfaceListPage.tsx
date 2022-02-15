import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageHeader,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceList from './NetworkInterfaceList';

const NetworkInterfaceListPage: React.FC<any> = ({ match }) => {
  const { t } = useTranslation();
  const { ns, name, plural } = match.params;

  const [vm] = useK8sWatchResource<V1VirtualMachine>({
    isList: false,
    name,
    namespace: ns,
    groupVersionKind: plural,
  });
  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton>{t('Add network interface')}</ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <NetworkInterfaceList vm={vm} />
      </ListPageBody>
    </>
  );
};

export default NetworkInterfaceListPage;
