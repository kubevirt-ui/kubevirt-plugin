import * as React from 'react';
import { Link } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getConsoleVirtctlCommand } from '@kubevirt-utils/components/SSHAccess/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  const virtctlCommand = getConsoleVirtctlCommand(vm?.metadata?.name, vm?.metadata?.namespace);

  const isMachinePaused = vm?.status?.printableStatus === printableVMStatus.Paused;
  const isMachineStopped = vm?.status?.printableStatus === printableVMStatus.Stopped;

  return (
    <CardTitle className="text-muted card-title">
      <Link to={createURL('details', location?.pathname)}>{t('Details')}</Link>
      <Dropdown
        onSelect={() => setIsDropdownOpen(false)}
        toggle={<KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-disk" />}
        isOpen={isDropdownOpen}
        isPlain
        dropdownItems={[
          <DropdownItem
            onClick={() => virtctlCommand && navigator.clipboard.writeText(virtctlCommand)}
            key="copy"
            description={t('SSH using virtctl')}
          >
            {t('Copy SSH command')}{' '}
            <span className="text-muted">
              <CopyIcon />
            </span>
          </DropdownItem>,
          <DropdownItem onClick={() => (isMachineStopped ? startVM(vm) : stopVM(vm))} key="stop">
            {isMachineStopped ? t('Resume VirtualMachine') : t('Stop VirtualMachine')}
          </DropdownItem>,
          <DropdownItem onClick={() => (isMachinePaused ? unpauseVM(vm) : pauseVM(vm))} key="pause">
            {isMachinePaused ? t('Unpause VirtualMachine') : t('Pause VirtualMachine')}
          </DropdownItem>,
        ]}
      />
    </CardTitle>
  );
};

export default VirtualMachinesOverviewTabDetailsTitle;
