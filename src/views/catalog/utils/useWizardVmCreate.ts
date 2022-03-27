import { useState } from 'react';
import produce from 'immer';

import {
  createSysprepConfigMap,
  sysprepDisk,
  sysprepVolume,
} from '@catalog/wizard/tabs/scripts/utils/sysprep-utils';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { useWizardVMContext } from './WizardVMContext';

type CreateVMArguments = {
  namespace: string;
  startVM: boolean;
  onFullfilled: (vm: V1VirtualMachine) => void;
};

export const useWizardVmCreate = (): {
  createVM: (
    vm: V1VirtualMachine,
    { namespace, startVM, onFullfilled }: CreateVMArguments,
  ) => Promise<void>;
  loaded: boolean;
  error: any;
} => {
  const { tabsData } = useWizardVMContext();
  const [loaded, setLoaded] = useState<boolean>(true);
  const [error, setError] = useState<any>();

  const hasSysprep =
    tabsData?.scripts?.sysprep?.autounattend || tabsData?.scripts?.sysprep?.unattended;

  const createVM = (
    vm: V1VirtualMachine,
    { namespace, startVM, onFullfilled }: CreateVMArguments,
  ) => {
    setLoaded(false);
    setError(undefined);

    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      vmDraft.metadata.namespace = namespace;
      vmDraft.spec.running = startVM;

      if (hasSysprep) {
        vmDraft.spec.template.spec.domain.devices.disks.push(sysprepDisk());
        vmDraft.spec.template.spec.volumes.push(sysprepVolume(vmDraft));
      }
    });

    return k8sCreate<V1VirtualMachine>({
      model: VirtualMachineModel,
      data: updatedVM,
    })
      .then((newVM) => {
        if (hasSysprep) {
          return createSysprepConfigMap(newVM, tabsData?.scripts?.sysprep).then(() => newVM);
        }
        return newVM;
      })
      .then(onFullfilled)
      .catch(setError)
      .finally(() => setLoaded(true));
  };

  return {
    createVM,
    loaded,
    error,
  };
};
