import * as React from 'react';
import { Link } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getConsoleVirtctlCommand } from '@kubevirt-utils/components/SSHAccess/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import { CardTitle, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';

import { pauseVM, startVM, stopVM, unpauseVM } from '../../../../../../actions/actions';
import { printableVMStatus } from '../../../../../../utils';
import { createURL } from '../../../utils/utils';

type VirtualMachinesOverviewTabDetailsTitleProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabDetailsTitle: React.FC<
  VirtualMachinesOverviewTabDetailsTitleProps
> = ({ vm }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { t } = useKubevirtTranslation();
  const userName = getCloudInitCredentials(vm)?.users?.[0]?.name;
  const virtctlCommand = getConsoleVirtctlCommand(
    userName,
    vm?.metadata?.name,
    vm?.metadata?.namespace,
  );

  const isMachinePaused = vm?.status?.printableStatus === printableVMStatus.Paused;
  const isMachineStopped = vm?.status?.printableStatus === printableVMStatus.Stopped;

  return (
    <CardTitle className="text-muted card-title">
      <Link to={createURL('details', location?.pathname)}>{t('Details')}</Link>
      <Dropdown
        dropdownItems={[
          <DropdownItem
            description={t('SSH using virtctl')}
            key="copy"
            onClick={() => virtctlCommand && navigator.clipboard.writeText(virtctlCommand)}
          >
            {t('Copy SSH command')}{' '}
            <span className="text-muted">
              <CopyIcon />
            </span>
          </DropdownItem>,
          <DropdownItem key="stop" onClick={() => (isMachineStopped ? startVM(vm) : stopVM(vm))}>
            {isMachineStopped ? t('Resume VirtualMachine') : t('Stop VirtualMachine')}
          </DropdownItem>,
          <DropdownItem key="pause" onClick={() => (isMachinePaused ? unpauseVM(vm) : pauseVM(vm))}>
            {isMachinePaused ? t('Unpause VirtualMachine') : t('Pause VirtualMachine')}
          </DropdownItem>,
        ]}
        isOpen={isDropdownOpen}
        isPlain
        onSelect={() => setIsDropdownOpen(false)}
        toggle={<KebabToggle id="toggle-id-disk" onToggle={setIsDropdownOpen} />}
      />
    </CardTitle>
  );
};

export default VirtualMachinesOverviewTabDetailsTitle;
