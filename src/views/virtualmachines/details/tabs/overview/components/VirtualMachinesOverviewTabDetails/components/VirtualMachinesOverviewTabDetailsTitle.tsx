import * as React from 'react';
import { Link } from 'react-router-dom';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import useSSHCommand from '@kubevirt-utils/components/UserCredentials/useSSHCommand';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm/hooks';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { CardTitle, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';

import { pauseVM, startVM, stopVM, unpauseVM } from '../../../../../../actions/actions';
import { printableVMStatus } from '../../../../../../utils';
import { createURL } from '../../../utils/url';

type VirtualMachinesOverviewTabDetailsTitleProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabDetailsTitle: React.FC<
  VirtualMachinesOverviewTabDetailsTitleProps
> = ({ vm }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [sshService] = useSSHService(vmi);
  const { command } = useSSHCommand(vmi, sshService);

  const isMachinePaused = vm?.status?.printableStatus === printableVMStatus.Paused;
  const isMachineStopped = vm?.status?.printableStatus === printableVMStatus.Stopped;
  const isMachineRunning = vm?.status?.printableStatus === printableVMStatus.Running;

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
            onClick={() => command && navigator.clipboard.writeText(command)}
            key="copy"
            isDisabled={!isMachineRunning || !sshService}
          >
            {t('Copy SSH Command')}{' '}
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
          <DropdownItem
            onClick={() =>
              createModal((props) => (
                <CPUMemoryModal
                  vm={vm}
                  {...props}
                  onSubmit={(updatedVM) =>
                    k8sUpdate({
                      model: VirtualMachineModel,
                      data: updatedVM,
                      ns: updatedVM?.metadata?.namespace,
                      name: updatedVM?.metadata?.name,
                    })
                  }
                />
              ))
            }
            key="disk-edit"
          >
            {t('Edit CPU | Memory')}
          </DropdownItem>,
        ]}
      />
    </CardTitle>
  );
};

export default VirtualMachinesOverviewTabDetailsTitle;
