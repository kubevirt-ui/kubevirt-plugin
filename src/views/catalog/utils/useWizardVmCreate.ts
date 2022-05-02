import { useState } from 'react';
import produce from 'immer';

import { createVmSSHSecret } from '@catalog/wizard/tabs/scripts/utils/cloudint-utils';
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
  startVM: boolean;
  onFullfilled: (vm: V1VirtualMachine) => void;
};

type UseWizardVmCreateValues = {
  createVM: ({ startVM, onFullfilled }: CreateVMArguments) => Promise<void>;
  loaded: boolean;
  error: any;
};

export const useWizardVmCreate = (): UseWizardVmCreateValues => {
  const { vm, tabsData } = useWizardVMContext();
  const [loaded, setLoaded] = useState<boolean>(true);
  const [error, setError] = useState<any>();

  const createVM = async ({ startVM, onFullfilled }: CreateVMArguments) => {
    try {
      setLoaded(false);
      setError(undefined);

      const sshKey = tabsData?.scripts?.cloudInit?.sshKey;
      const hasSysprep =
        tabsData?.scripts?.sysprep?.autounattend || tabsData?.scripts?.sysprep?.unattended;

      const updatedVM = produce(vm, (vmDraft) => {
        vmDraft.spec.running = startVM;

        if (hasSysprep) {
          vmDraft.spec.template.spec.domain.devices.disks.push(sysprepDisk());
          vmDraft.spec.template.spec.volumes.push(sysprepVolume(vmDraft));
        }

        if (sshKey) {
          const cloudInitNoCloudVolume = vmDraft.spec.template.spec.volumes.find(
            (v) => v.cloudInitNoCloud,
          );
          if (cloudInitNoCloudVolume) {
            vmDraft.spec.template.spec.volumes = [
              {
                name: cloudInitNoCloudVolume.name,
                cloudInitConfigDrive: { ...cloudInitNoCloudVolume.cloudInitNoCloud },
              },
              ...vmDraft.spec.template.spec.volumes.filter((v) => !v.cloudInitNoCloud),
            ];
          }

          vmDraft.spec.template.spec.accessCredentials = [
            {
              sshPublicKey: {
                source: {
                  secret: {
                    secretName: `${vmDraft.metadata.name}-ssh-key`,
                  },
                },
                propagationMethod: {
                  configDrive: {},
                },
              },
            },
          ];
        }
      });

      const newVM = await k8sCreate<V1VirtualMachine>({
        model: VirtualMachineModel,
        data: updatedVM,
      });

      if (hasSysprep) {
        await createSysprepConfigMap(newVM, tabsData?.scripts?.sysprep);
      }

      if (sshKey) {
        await createVmSSHSecret(newVM, sshKey);
      }

      setLoaded(true);
      onFullfilled(newVM);
    } catch (e) {
      setLoaded(true);
      setError(e);
    }
  };

  return {
    createVM,
    loaded,
    error,
  };
};
