import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

export const SYSPREP = 'sysprep';
export const AUTOUNATTEND = 'Autounattend.xml';
export const UNATTEND = 'Unattend.xml';

export type SysprepData = { autounattend?: string; unattended?: string };

export const sysprepDisk = () => ({ cdrom: { bus: 'sata' }, name: SYSPREP });

export const sysprepVolume = (vm: V1VirtualMachine) => ({
  sysprep: {
    configMap: { name: `sysprep-config-${vm?.metadata?.name}` },
  },
  name: SYSPREP,
});

export const createSysprepConfigMap = async (vm: V1VirtualMachine, data: SysprepData) => {
  try {
    await k8sCreate({
      model: ConfigMapModel,
      data: {
        kind: ConfigMapModel.kind,
        apiVersion: ConfigMapModel.apiVersion,
        metadata: {
          name: `sysprep-config-${vm?.metadata?.name}`,
          namespace: vm?.metadata?.namespace,
          ownerReferences: [buildOwnerReference(vm, { blockOwnerDeletion: false })],
        },
        ...(data && {
          data: {
            ...(data?.autounattend && { [AUTOUNATTEND]: data?.autounattend }),
            ...(data?.unattended && { [UNATTEND]: data?.unattended }),
          },
        }),
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Failed to create sysprep ConfigMap', e.message);
  }
};
