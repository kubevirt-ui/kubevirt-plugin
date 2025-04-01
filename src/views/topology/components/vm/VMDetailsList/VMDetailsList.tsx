import React, { FC } from 'react';

import { modelToGroupVersionKind, NodeModel, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Pod, IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import BootOrderSummary from '@kubevirt-utils/components/BootOrder/BootOrderSummary';
import BootOrderModal from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { checkBootOrderChanged } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import { SSH_PORT } from '@kubevirt-utils/components/SSHAccess/constants';
import useSSHCommand from '@kubevirt-utils/components/SSHAccess/useSSHCommand';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import VMSSHSecretModal from '@kubevirt-utils/components/VMSSHSecretModal/VMSSHSecretModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { getName, getNamespace, getVMStatus } from '@kubevirt-utils/resources/shared';
import { WORKLOADS_LABELS } from '@kubevirt-utils/resources/template';
import { getGPUDevices, getHostDevices, getWorkload } from '@kubevirt-utils/resources/vm';
import {
  getVMIIPAddresses,
  getVMINodeName,
  getVMIPod,
  useGuestOS,
} from '@kubevirt-utils/resources/vmi';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  GenericStatus,
  getGroupVersionKindForModel,
  K8sModel,
  k8sUpdate,
  K8sVerb,
  ResourceLink,
  useAccessReview,
} from '@openshift-console/dynamic-plugin-sdk';
import { ClipboardCopy } from '@patternfly/react-core';
import { updateBootOrder } from '@virtualmachines/details/tabs/configuration/details/utils/utils';
import { getVMStatusIcon, isPaused, isRunning } from '@virtualmachines/utils';

import { getNodeName, isVMIReady } from '../../../utils/selectors/selectors';
import { getBasicID, prefixedID } from '../../../utils/utils';
import PermissionsErrorModal from '../../modals/PermissionsErrorModal';
import VMStatusModal from '../../modals/VMStatusModal';
import VMEditWithPencil from '../../VMEditWithPencil';
import VMIP from '../VMIPAddresses/VMIPAddresses';

import VMDetailsItem from './components/VMDetailsItem';

export type VMResourceListProps = {
  canUpdateVM: boolean;
  kindObj: K8sModel;
  pods?: IoK8sApiCoreV1Pod[];
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
  vmSSHService?: IoK8sApiCoreV1Service;
};

const VMDetailsList: FC<VMResourceListProps> = ({ canUpdateVM, kindObj, pods, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys] = useKubevirtUserSettings('ssh');
  const [guestAgentData] = useGuestOS(vmi);
  const hostname = guestAgentData?.hostname;
  const timeZone = guestAgentData?.timezone;

  const vmStatus = getVMStatus(vm);

  const isVM = kindObj === VirtualMachineModel;
  const vmiLike = isVM ? vm : vmi;
  const guestAgentFieldNotAvailMsg = t('Guest agent is required');

  const canEditWhileVMRunning = vmiLike && canUpdateVM && kindObj !== VirtualMachineInstanceModel;

  const launcherPod = getVMIPod(vmi, pods);
  const id = getBasicID(vmiLike);
  const nodeName = getVMINodeName(vmi) || getNodeName(launcherPod);
  const ipAddresses = getVMIIPAddresses(vmi);
  const vmWorkload = getWorkload(vm);
  const workloadProfile = WORKLOADS_LABELS[vmWorkload] || vmWorkload;

  const [sshService] = useSSHService(vm);

  const { command, user } = useSSHCommand(vm, sshService);
  const vmiReady = isVMIReady(vmi);
  const sshServiceRunning = !!sshService;
  const sshServicePort = sshService?.spec?.ports?.find(
    (port) => parseInt(port.targetPort, 10) === SSH_PORT,
  )?.nodePort;

  const [canWatchHC] = useAccessReview({
    group: HyperConvergedModel?.apiGroup,
    resource: HyperConvergedModel?.plural,
    verb: 'watch',
  });

  const [canGetNode] = useAccessReview({
    namespace: getNamespace(vm),
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const sshDisplayInformation = sshServiceRunning
    ? t('port: {{port}}', { port: sshServicePort })
    : t('SSH service disabled');

  const onUpdateVM = (updatedVM: V1VirtualMachine) =>
    k8sUpdate({
      data: updatedVM,
      model: VirtualMachineModel,
      name: updatedVM?.metadata?.name,
      ns: updatedVM?.metadata?.namespace,
    }).catch((err) => kubevirtConsole.error(err));

  return (
    <dl className="co-m-pane__details">
      <VMDetailsItem
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <VMStatusModal isOpen={isOpen} onClose={onClose} vm={vm} />
          ))
        }
        canEdit={isPaused(vm)}
        editButtonId={prefixedID(id, 'status-edit')}
        idValue={prefixedID(id, 'vm-statuses')}
        title={t('Status')}
      >
        <GenericStatus Icon={getVMStatusIcon(vmStatus)} title={vmStatus} />
      </VMDetailsItem>

      <VMDetailsItem idValue={prefixedID(id, 'pod')} isNotAvail={!launcherPod} title={t('Pod')}>
        {launcherPod && (
          <ResourceLink
            groupVersionKind={getGroupVersionKindForModel(PodModel)}
            name={getName(launcherPod)}
            namespace={getNamespace(launcherPod)}
          />
        )}
      </VMDetailsItem>

      <VMDetailsItem
        onEditClick={() =>
          createModal((props) => (
            <BootOrderModal
              {...props}
              onSubmit={(updatedVM: V1VirtualMachine) => updateBootOrder(updatedVM)}
              vm={vm}
              vmi={vmi}
            />
          ))
        }
        arePendingChanges={isVM && isRunning(vm) && checkBootOrderChanged(vm, vmi)}
        canEdit={canEditWhileVMRunning}
        dataTest="boot-order-details-item"
        editButtonId={prefixedID(id, 'boot-order-edit')}
        idValue={prefixedID(id, 'boot-order')}
        title={t('Boot order')}
      >
        <BootOrderSummary vm={vm} />
      </VMDetailsItem>

      <VMDetailsItem
        idValue={prefixedID(id, 'ip-addresses')}
        isNotAvail={!launcherPod || !ipAddresses}
        title={t('IP address')}
      >
        {launcherPod && ipAddresses && <VMIP ipAddresses={ipAddresses} />}
      </VMDetailsItem>

      <VMDetailsItem
        idValue={prefixedID(id, 'hostname')}
        isNotAvail={!hostname}
        isNotAvailMessage={guestAgentFieldNotAvailMsg}
        title={t('Hostname')}
      >
        {hostname}
      </VMDetailsItem>

      <VMDetailsItem
        idValue={prefixedID(id, 'timezone')}
        isNotAvail={!timeZone}
        isNotAvailMessage={guestAgentFieldNotAvailMsg}
        title={t('Time zone')}
      >
        {timeZone}
      </VMDetailsItem>

      <VMDetailsItem
        idValue={prefixedID(id, 'node')}
        isNotAvail={!launcherPod || !nodeName}
        title={t('Node')}
      >
        {canGetNode && launcherPod && nodeName && (
          <ResourceLink groupVersionKind={modelToGroupVersionKind(NodeModel)} name={nodeName} />
        )}
      </VMDetailsItem>

      <VMDetailsItem
        idValue={prefixedID(id, 'workload-profile')}
        isNotAvail={!workloadProfile}
        title={t('Workload profile')}
      >
        {workloadProfile}
      </VMDetailsItem>

      <VMDetailsItem idValue={prefixedID(id, 'authorized-ssh-key')} title={t('User credentials')}>
        {vmiReady ? (
          <>
            <span data-test="details-item-user-credentials-user-name">
              {t('user: {{user}}', { user })}
            </span>
            <ClipboardCopy
              className="SSHDetailsPage-clipboard-command"
              data-test="SSHDetailsPage-command"
              isReadOnly
            >
              {sshServiceRunning ? command : `ssh ${user}@`}
            </ClipboardCopy>
            {!sshServiceRunning && (
              <span className="kubevirt-menu-actions__secondary-title">
                {t('Requires SSH service')}
              </span>
            )}
          </>
        ) : (
          <div className="text-secondary">{t('Virtual machine not running')}</div>
        )}
      </VMDetailsItem>

      <VMDetailsItem
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <VMSSHSecretModal
              authorizedSSHKeys={authorizedSSHKeys}
              isOpen={isOpen}
              onClose={onClose}
              updateAuthorizedSSHKeys={updateAuthorizedSSHKeys}
              updateVM={onUpdateVM}
              vm={vm}
            />
          ))
        }
        canEdit={vmiReady}
        dataTest="ssh-access-details-item"
        idValue={prefixedID(id, 'ssh-access')}
        title={t('SSH access')}
      >
        <span data-test="details-item-ssh-access-port">
          {vmiReady ? (
            sshDisplayInformation
          ) : (
            <div className="text-secondary">{t('Virtual machine not running')}</div>
          )}
        </span>
      </VMDetailsItem>

      <VMDetailsItem
        editButtonId={prefixedID(id, 'hardware-devices-edit')}
        idValue={prefixedID(id, 'hardware-devices')}
        title={t('Hardware devices')}
      >
        <VMEditWithPencil
          onEditClick={
            canWatchHC
              ? () =>
                  createModal(({ isOpen, onClose }) => (
                    <HardwareDevicesModal
                      btnText={t('Add GPU device')}
                      headerText={t('GPU devices')}
                      initialDevices={getGPUDevices(vm)}
                      isOpen={isOpen}
                      onClose={onClose}
                      onSubmit={onUpdateVM}
                      type={HARDWARE_DEVICE_TYPE.GPUS}
                      vm={vm}
                      vmi={vmi}
                    />
                  ))
              : () =>
                  createModal(({ isOpen, onClose }) => (
                    <PermissionsErrorModal
                      errorMsg={t(
                        'You do not have permissions to attach GPU devices. Contact your system administrator for more information.',
                      )}
                      isOpen={isOpen}
                      onClose={onClose}
                      title={t('Attach GPU device to VM')}
                    />
                  ))
          }
          isEdit={isVM}
        >
          {t('{{gpusCount}} GPU devices', {
            gpusCount: getGPUDevices(vm)?.length || [].length,
          })}
        </VMEditWithPencil>
        <br />
        <VMEditWithPencil
          onEditClick={
            canWatchHC
              ? () =>
                  createModal(({ isOpen, onClose }) => (
                    <HardwareDevicesModal
                      btnText={t('Add Host device')}
                      headerText={t('Host devices')}
                      initialDevices={getHostDevices(vm)}
                      isOpen={isOpen}
                      onClose={onClose}
                      onSubmit={onUpdateVM}
                      type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
                      vm={vm}
                      vmi={vmi}
                    />
                  ))
              : () =>
                  createModal(({ isOpen, onClose }) => (
                    <PermissionsErrorModal
                      errorMsg={t(
                        'You do not have permissions to attach Host devices. Contact your system administrator for more information.',
                      )}
                      isOpen={isOpen}
                      onClose={onClose}
                      title={t('Attach GPU device to VM')}
                    />
                  ))
          }
          isEdit={isVM}
        >
          {t('{{hostDevicesCount}} Host devices', {
            hostDevicesCount: getHostDevices(vm)?.length || [].length,
          })}
        </VMEditWithPencil>
      </VMDetailsItem>
    </dl>
  );
};

export default VMDetailsList;
