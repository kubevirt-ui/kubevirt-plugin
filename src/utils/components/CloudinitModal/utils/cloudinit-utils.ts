import produce from 'immer';
import { dump, load } from 'js-yaml';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1CloudInitConfigDriveSource,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { k8sCreate, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { CLOUD_CONFIG_HEADER } from './consts';

export const deleteObjBlankValues = (obj: object) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => !!v));

export const getCloudInitVolume = (vm: V1VirtualMachine): V1Volume => {
  return getVolumes(vm)?.find((vol) => !!vol.cloudInitConfigDrive || !!vol.cloudInitNoCloud);
};

export const getCloudInitData = (cloudInitVolume: V1Volume): V1CloudInitConfigDriveSource => {
  return cloudInitVolume?.cloudInitConfigDrive || cloudInitVolume?.cloudInitNoCloud;
};

export const convertYAMLUserDataObject = (userData: string): CloudInitUserData => {
  try {
    return load(userData) as CloudInitUserData;
  } catch (e) {
    return undefined;
  }
};

export const convertUserDataObjectToYAML = (
  userData: CloudInitUserData,
  addHeader: boolean,
): string => {
  try {
    const filteredUser = deleteObjBlankValues(userData);
    const result = dump(filteredUser);
    return addHeader ? `${CLOUD_CONFIG_HEADER}\n${result}` : result;
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export const convertYAMLToNetworkDataObject = (networkData: string): CloudInitNetworkData => {
  try {
    const networkObj = load(networkData) as CloudInitNetwork;
    const networkToEdit = networkObj?.network?.config?.[0];

    return {
      name: networkToEdit?.name,
      address: Array.isArray(networkToEdit?.subnets?.[0]?.address)
        ? networkToEdit?.subnets?.[0]?.address?.join(',')
        : networkToEdit?.subnets?.[0]?.address,
      gateway: networkToEdit?.subnets?.[0]?.gateway,
    };
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export const convertNetworkDataObjectToYAML = (networkData: CloudInitNetworkData): string => {
  try {
    const hasValue = networkData?.name || networkData?.address || networkData?.gateway;
    return (
      hasValue &&
      dump({
        network: {
          version: '1',
          config: [
            {
              type: 'physical',
              name: networkData?.name,
              subnets: [
                {
                  type: 'static',
                  address: networkData?.address?.replace(/\s/g, '').split(','),
                  gateway: networkData?.gateway,
                },
              ],
            },
          ],
        },
      })
    );
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export const createDefaultCloudInitYAML = () =>
  convertUserDataObjectToYAML(
    {
      user: '',
      password: '',
      hostname: '',
    },
    true,
  );

export const createVmSSHSecret = (vm: V1VirtualMachine, sshKey: string, secretName?: string) =>
  k8sCreate<K8sResourceCommon & { data?: { [key: string]: string } }>({
    model: SecretModel,
    data: {
      kind: SecretModel.kind,
      apiVersion: SecretModel.apiVersion,
      metadata: {
        name: secretName || `${vm.metadata.name}-ssh-key`,
        namespace: vm.metadata.namespace,
        ownerReferences: [buildOwnerReference(vm, { blockOwnerDeletion: false })],
      },
      data: { key: btoa(sshKey) },
    },
  });

export const addSecretToVM = (vm: V1VirtualMachine, secretName?: string) =>
  produce(vm, (vmDraft) => {
    const cloudInitNoCloudVolume = vm.spec.template.spec.volumes?.find((v) => v.cloudInitNoCloud);
    if (cloudInitNoCloudVolume) {
      vmDraft.spec.template.spec.volumes = vm.spec.template.spec.volumes.filter(
        (v) => !v.cloudInitNoCloud,
      );
      vmDraft.spec.template.spec.volumes.push({
        name: cloudInitNoCloudVolume.name,
        cloudInitConfigDrive: { ...cloudInitNoCloudVolume.cloudInitNoCloud },
      });
    }
    vmDraft.spec.template.spec.accessCredentials = [
      {
        sshPublicKey: {
          source: {
            secret: {
              secretName: secretName || `${vm.metadata.name}-ssh-key`,
            },
          },
          propagationMethod: {
            configDrive: {},
          },
        },
      },
    ];
  });

export const removeSecretToVM = (vm: V1VirtualMachine) =>
  produce(vm, (vmDraft) => {
    vmDraft.spec.template.spec.accessCredentials = null;
  });

export type CloudInitUserData = {
  user: string;
  password: string;
  hostname: string;
  chpasswd?: { expire?: boolean };
};

export type CloudInitNetworkData = {
  name: string;
  address: string;
  gateway: string;
};

type CloudInitNetwork = {
  network: {
    version: string;
    config: {
      type: string;
      name: string;
      mac_address?: string;
      subnets: { type: string; address: string[]; gateway: string }[];
    }[];
  };
};
