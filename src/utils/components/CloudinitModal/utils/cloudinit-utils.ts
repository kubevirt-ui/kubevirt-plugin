import { dump, load } from 'js-yaml';

import {
  V1CloudInitConfigDriveSource,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVolumes } from '@kubevirt-utils/resources/vm';

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

export type CloudInitUserData = {
  chpasswd?: { expire?: boolean };
  hostname: string;
  password: string;
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
