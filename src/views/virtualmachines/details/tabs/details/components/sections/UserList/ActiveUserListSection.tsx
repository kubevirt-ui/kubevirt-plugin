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
  pathname: string;
  vm: V1VirtualMachine;
};

const ActiveUserListSection: React.FC<ActiveUserListProps> = ({ pathname, vm }) => {
  const { t } = useKubevirtTranslation();
  const columns = useActiveUsersColumnsVm();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [{ userList = [] }, loaded, loadError] = useGuestOS(vmi);

  const bodyTable =
    vmi && isGuestAgentConnected(vmi) ? (
      <VirtualizedTable<V1VirtualMachineInstanceGuestOSUser>
        NoDataEmptyMsg={() => (
          <div className="pf-u-text-align-center" id="no-active-users-msg">
            {t('No active users')}
          </div>
        )}
        columns={columns}
        data={userList}
        loaded={loaded}
        loadError={loadError}
        Row={ActiveUserListRowVm}
        unfilteredData={userList}
      />
    ) : (
      <Bullseye>
        <MutedTextSpan
          text={vmi ? t('Guest agent is required') : t('VirtualMachine is not running')}
        />
      </Bullseye>
    );

  return (
    <div className="VirtualMachinesDetailsSection">
      <a className="link-icon" href={`${pathname}#logged-in-users`}>
        <LinkIcon size="sm" />
      </a>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Active users')}
      </Title>
      {bodyTable}
    </div>
  );
};

export default ActiveUserListSection;
