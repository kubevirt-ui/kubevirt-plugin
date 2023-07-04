import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { pauseVM, startVM, stopVM, unpauseVM } from 'src/views/virtualmachines/actions/actions';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getConsoleVirtctlCommand } from '@kubevirt-utils/components/SSHAccess/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { CardTitle, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';

import { createURL } from '../../../utils/utils';

type VirtualMachinesOverviewTabDetailsTitleProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabDetailsTitle: FC<VirtualMachinesOverviewTabDetailsTitleProps> = ({
  vm,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t } = useKubevirtTranslation();
  const virtctlCommand = getConsoleVirtctlCommand(vm);

  const isMachinePaused = vm?.status?.printableStatus === printableVMStatus.Paused;
  const isMachineStopped = vm?.status?.printableStatus === printableVMStatus.Stopped;

  return (
    <CardTitle className="text-muted card-title">
      <Link to={createURL('details', location?.pathname)}>{t('Details')}</Link>
      <Dropdown
        dropdownItems={[
          <DropdownItem
            description={t('SSH using virtctl')}
            isDisabled={isEmpty(getVMSSHSecretName(vm))}
            key="copy"
            onClick={() => virtctlCommand && navigator.clipboard.writeText(virtctlCommand)}
          >
            {t('Copy SSH command')}{' '}
            <span className="text-muted">
              <CopyIcon />
            </span>
          </DropdownItem>,
          <DropdownItem key="stop" onClick={() => (isMachineStopped ? startVM(vm) : stopVM(vm))}>
            {isMachineStopped ? t('Start VirtualMachine') : t('Stop VirtualMachine')}
          </DropdownItem>,
          <DropdownItem
            isDisabled={isMachineStopped}
            key="pause"
            onClick={() => (isMachinePaused ? unpauseVM(vm) : pauseVM(vm))}
          >
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
