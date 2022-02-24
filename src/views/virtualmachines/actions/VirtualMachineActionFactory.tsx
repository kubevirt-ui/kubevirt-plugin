// import * as React from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Action } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../list/VirtualMachinesList';

import {
  cancelMigration,
  deleteVM,
  migrateVM,
  pauseVM,
  restartVM,
  startVM,
  stopVM,
  unpauseVM,
} from './actions';

const {
  Stopped,
  Migrating,
  Provisioning,
  Starting,
  Running,
  Paused,
  Stopping,
  Terminating,
  Unknown,
} = printableVMStatus;

export const VirtualMachineActionFactory = {
  start: (vm: V1VirtualMachine): Action => {
    return {
      id: 'vm-action-start',
      disabled: [
        Starting,
        Stopping,
        Terminating,
        Provisioning,
        Migrating,
        Running,
        Unknown,
      ].includes(vm?.status?.printableStatus),
      label: 'Start',
      cta: () => startVM(vm),
      //   accessReview: {},
    };
  },
  stop: (vm: V1VirtualMachine): Action => {
    return {
      id: 'vm-action-stop',
      disabled: [Starting, Stopping, Terminating, Stopped, Paused, Unknown].includes(
        vm?.status?.printableStatus,
      ),
      label: 'Stop',
      cta: () => stopVM(vm),
      //   accessReview: {},
    };
  },
  restart: (vm: V1VirtualMachine): Action => {
    return {
      id: 'vm-action-restart',
      disabled: [
        Starting,
        Stopping,
        Terminating,
        Provisioning,
        Migrating,
        Stopped,
        Unknown,
      ].includes(vm?.status?.printableStatus),
      label: 'Restart',
      cta: () => restartVM(vm),
      //   accessReview: {},
    };
  },
  pause: (vm: V1VirtualMachine): Action => {
    return {
      id: 'vm-action-pause',
      disabled: vm?.status?.printableStatus !== Running,
      label: 'Pause',
      cta: () => pauseVM(vm),
      //   accessReview: {},
    };
  },
  unpause: (vm: V1VirtualMachine): Action => {
    return {
      id: 'vm-action-unpause',
      disabled: vm?.status?.printableStatus !== Paused,
      label: 'Unpause',
      cta: () => unpauseVM(vm),
      //   accessReview: {},
    };
  },
  migrate: (vm: V1VirtualMachine): Action => {
    return {
      id: 'vm-action-migrate',
      disabled:
        vm?.status?.printableStatus !== Running ||
        !!vm?.status?.conditions?.find(
          ({ type, status }) => type === 'LiveMigratable' && status === 'False',
        ),
      label: 'Migrate node to node',
      cta: () => migrateVM(vm),
      //   accessReview: {},
    };
  },
  cancelMigration: (vm: V1VirtualMachine, vmim: V1VirtualMachineInstanceMigration): Action => {
    return {
      id: 'vm-action-cancel-migrate',
      disabled: vm?.status?.printableStatus !== Migrating,
      label: 'Cancel virtual machine migration',
      cta: () => cancelMigration(vmim),
      //   accessReview: {},
    };
  },
  //   clone: (vm: V1VirtualMachine): Action => {},
  // console component is needed to allow openConsole action
  // openConsole: (vm: V1VirtualMachine): Action => {
  //   return {
  //     id: 'vm-action-open-console',
  //     disabled: false,
  //     label: 'Open console',
  //     cta: () =>
  //       window.open(
  //         `/k8s/ns/${vm?.metadata?.namespace}/virtualmachineinstances/${vm?.metadata?.name}/standaloneconsole`,
  //         `${vm?.metadata?.name}-console}`,
  //         'modal=yes,alwaysRaised=yes,location=yes,width=1024,height=768',
  //       ),
  //   };
  // },
  delete: (vm: V1VirtualMachine): Action => {
    return {
      id: 'vm-action-delete',
      disabled: false,
      label: 'Delete',
      cta: () => deleteVM(vm),
    };
  },
};
