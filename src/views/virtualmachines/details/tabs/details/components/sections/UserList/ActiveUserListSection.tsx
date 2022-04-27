import * as React from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceGuestOSUser,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { isGuestAgentConnected } from '@kubevirt-utils/resources/vmi';
import { useGuestOS } from '@kubevirt-utils/resources/vmi/hooks';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

import useActiveUsersColumnsVm from './hooks/useActiveUsersColumnsVm';
import ActiveUserListRowVm from './ActiveUserListRowVm';

type ActiveUserListProps = {
  vm: V1VirtualMachine;
  pathname: string;
};

const ActiveUserListSection: React.FC<ActiveUserListProps> = ({ vm, pathname }) => {
  const { t } = useKubevirtTranslation();
  const columns = useActiveUsersColumnsVm();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [{ userList = [] }, loaded, loadError] = useGuestOS(vmi);

  const bodyTable =
    vmi && isGuestAgentConnected(vmi) ? (
      <VirtualizedTable<V1VirtualMachineInstanceGuestOSUser>
        data={userList}
        unfilteredData={userList}
        loaded={loaded}
        loadError={loadError}
        columns={columns}
        Row={ActiveUserListRowVm}
        NoDataEmptyMsg={() => (
          <div id="no-active-users-msg" className="pf-u-text-align-center">
            {t('No Active Users')}
          </div>
        )}
      />
    ) : (
      <Bullseye>
        <MutedTextSpan
          text={vmi ? t('Guest Agent is required') : t('VirtualMachine is not running')}
        />
      </Bullseye>
    );

  return (
    <div className="VirtualMachinesDetailsSection">
      <a href={`${pathname}#logged-in-users`} className="link-icon">
        <LinkIcon size="sm" />
      </a>
      <Title headingLevel="h2" className="co-section-heading">
        {t('Active Users')}
      </Title>
      {bodyTable}
    </div>
  );
};

export default ActiveUserListSection;
