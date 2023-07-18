import produce from 'immer';
import { dump, load, LoadOptions } from 'js-yaml';

import {
  V1CloudInitConfigDriveSource,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { ACTIVATION_KEY, CLOUD_CONFIG_HEADER } from './consts';

export const deleteObjBlankValues = (obj: object) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => !!v));

export const getCloudInitVolume = (vm: V1VirtualMachine): V1Volume => {
  return getVolumes(vm)?.find((vol) => !!vol.cloudInitConfigDrive || !!vol.cloudInitNoCloud);
};

export const getCloudInitData = (cloudInitVolume: V1Volume): V1CloudInitConfigDriveSource => {
  return cloudInitVolume?.cloudInitConfigDrive || cloudInitVolume?.cloudInitNoCloud;
};

export const convertYAMLUserDataObject = (
  userData: string,
  opts?: LoadOptions,
): CloudInitUserData => {
  try {
    return load(userData, opts) as CloudInitUserData;
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
      address: Array.isArray(networkToEdit?.subnets?.[0]?.address)
        ? networkToEdit?.subnets?.[0]?.address?.join(',')
        : networkToEdit?.subnets?.[0]?.address,
      gateway: networkToEdit?.subnets?.[0]?.gateway,
      name: networkToEdit?.name,
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
          config: [
            {
              name: networkData?.name,
              subnets: [
                {
                  address: networkData?.address?.replace(/\s/g, '').split(','),
                  gateway: networkData?.gateway,
                  type: 'static',
                },
              ],
              type: 'physical',
            },
          ],
          version: '1',
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
      hostname: '',
      password: '',
      user: '',
    },
    true,
  );

export const updateVMRHELSubscription = (
  vm: V1VirtualMachine,
  subscriptionData: RHELAutomaticSubscriptionData,
): V1VirtualMachine => {
  const { activationKey, organizationID } = subscriptionData || {};

  if (isEmpty(organizationID) || isEmpty(activationKey)) {
    return vm;
  }

  const cloudInitVol = getCloudInitVolume(vm);
  const restVolumes = getVolumes(vm).filter((vol) => vol?.name !== cloudInitVol?.name);
  const cloudInitVolData = getCloudInitData(cloudInitVol);

  const userDataObject = convertYAMLUserDataObject(cloudInitVolData?.userData);

  const updatedUserDataObject = produce(userDataObject, (draftUserDataObject) => {
    draftUserDataObject.rh_subscription = {
      [ACTIVATION_KEY]: activationKey,
      org: organizationID,
    };
  });

  const updatedCloudInitVolumeData = produce(cloudInitVolData, (draftCloudInitVolumeData) => {
    draftCloudInitVolumeData.userData = convertUserDataObjectToYAML(updatedUserDataObject, true);
  });

  const updatedCloudInitVolume = produce(cloudInitVol, (draftCloudInitVolume) => {
    if (cloudInitVol?.cloudInitConfigDrive) {
      draftCloudInitVolume.cloudInitConfigDrive = updatedCloudInitVolumeData;
      return;
    }
    draftCloudInitVolume.cloudInitNoCloud = updatedCloudInitVolumeData;
  });

  const updatedVM = produce(vm, (draftVM) => {
    draftVM.spec.template.spec.volumes = [...restVolumes, updatedCloudInitVolume];
  });

  return updatedVM;
};

export type CloudInitUserData = {
  chpasswd?: { expire?: boolean };
  hostname: string;
  password: string;
  rh_subscription?: {
    [ACTIVATION_KEY]: string;
    org: string;
  };
  user: string;
};

export type CloudInitNetworkData = {
  address: string;
  gateway: string;
  name: string;
};

type CloudInitNetwork = {
  network: {
    config: {
      mac_address?: string;
      name: string;
      subnets: { address: string[]; gateway: string; type: string }[];
      type: string;
    }[];
    version: string;
  };
};
