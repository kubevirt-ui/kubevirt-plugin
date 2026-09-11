// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import { type TFunction } from 'i18next';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { logVMConsoleOpened } from '@kubevirt-utils/extensions/telemetry/dashboard';
import { TELEMETRY_CONSOLE_SESSION_TYPE } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { asAccessReview, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { getConsoleStandaloneURL } from '@multicluster/urls';
import { CopyIcon } from '@patternfly/react-icons';

import { isRunning } from '../utils';

import { ACTIONS_ID } from './hooks/constants';
import { openLabelsModal, openMoveToFolderModal, openRunStrategyModal } from './vmMetadataModals';

export type MetadataConsoleActions = {
  controlActions: (controlActions: ActionDropdownItemType[]) => ActionDropdownItemType;
  copySSHCommand: (vm: V1VirtualMachine, command: string) => ActionDropdownItemType;
  editLabels: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  editRunStrategy: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  moveToFolder: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ) => ActionDropdownItemType;
  openConsole: (vm: V1VirtualMachine) => ActionDropdownItemType;
};

export const createMetadataConsoleActions = (t: TFunction): MetadataConsoleActions => ({
  controlActions: (controlActions: ActionDropdownItemType[]): ActionDropdownItemType => ({
    cta: () => null,
    id: ACTIONS_ID.CONTROL_MENU,
    label: t('Control'),
    options: controlActions,
  }),
  copySSHCommand: (vm: V1VirtualMachine, command: string): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
    cta: (): void => {
      if (command) {
        navigator.clipboard.writeText(command).catch(kubevirtConsole.error);
      }
    },
    description: t('SSH using virtctl'),
    disabled: isEmpty(getVMSSHSecretName(vm)),
    icon: <CopyIcon />,
    id: ACTIONS_ID.COPY_SSH_COMMAND,
    label: t('Copy SSH command'),
  }),
  editLabels: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
    cta: (): void => openLabelsModal(vm, createModal),
    id: ACTIONS_ID.EDIT_LABELS,
    label: t('Edit labels'),
  }),
  editRunStrategy: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
    cta: (): void => openRunStrategyModal(vm, createModal),
    id: ACTIONS_ID.EDIT_RUN_STRATEGY,
    label: t('Edit run strategy'),
  }),
  moveToFolder: (
    vm: V1VirtualMachine,
    createModal: (modal: ModalComponent) => void,
  ): ActionDropdownItemType => ({
    accessReview: asAccessReview(VirtualMachineModel, vm, 'patch'),
    cta: (): void => openMoveToFolderModal(vm, createModal),
    id: ACTIONS_ID.MOVE_TO_FOLDER,
    label: t('Move to group'),
  }),
  openConsole: (vm: V1VirtualMachine): ActionDropdownItemType => ({
    cta: (): void => {
      logVMConsoleOpened(TELEMETRY_CONSOLE_SESSION_TYPE.VNC);
      window.open(getConsoleStandaloneURL(getNamespace(vm), getName(vm), getCluster(vm)));
    },
    description: isRunning(vm)
      ? t('Open console in new tab')
      : t('The VirtualMachine is not running'),
    disabled: !isRunning(vm),
    id: ACTIONS_ID.OPEN_CONSOLE,
    label: t('Open console'),
  }),
});
