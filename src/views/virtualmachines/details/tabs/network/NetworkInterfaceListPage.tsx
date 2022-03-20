import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceList from './copmonents/list/NetworkInterfaceList';
import NetworkInterfaceModal from './copmonents/modal/NetworkInterfaceModal';

type NetworkInterfaceListPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const NetworkInterfaceListPage: React.FC<NetworkInterfaceListPageProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const actionText = t('Add Network Interface');
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton onClick={() => setIsOpen(true)}>{actionText}</ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <NetworkInterfaceList vm={vm} />
      </ListPageBody>
      {isOpen && (
        <NetworkInterfaceModal
          vm={vm}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          headerText={actionText}
        />
      )}
    </>
  );
};

export default NetworkInterfaceListPage;
