import produce from 'immer';
import { dump, load, LoadOptions } from 'js-yaml';

import {
  V1CloudInitNoCloudSource,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { ACTIVATION_KEY, CLOUD_CONFIG_HEADER } from './consts';

export const deleteObjBlankValues = (obj: object = {}) =>
  Object.fromEntries(Object.entries(obj)?.filter(([, v]) => !!v));

export const getCloudInitVolume = (vm: V1VirtualMachine): V1Volume => {
  return getVolumes(vm)?.find((vol) => !!vol.cloudInitConfigDrive || !!vol.cloudInitNoCloud);
};

export const getCloudInitData = (cloudInitVolume: V1Volume): V1CloudInitNoCloudSource => {
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
    kubevirtConsole.error(e);
    return undefined;
  }
};

export const convertYAMLToNetworkDataObject = (networkData: string): CloudInitNetworkData => {
  try {
    const networkObj = load(networkData) as CloudInitNetwork;

    const name = Object.keys(networkObj?.ethernets)?.[0];

    const ips =
      !isEmpty(networkObj?.ethernets?.[name]?.addresses) &&
      networkObj?.ethernets?.[name]?.addresses;

    const addresses = Array.isArray(ips) ? ips?.join(',') : ips;
    const gateway4 = networkObj?.ethernets?.[name]?.gateway4;

    const nonEmptyNetworkObj = !!addresses || !!name || !!gateway4;

    return (
      nonEmptyNetworkObj && {
        addresses,
        gateway4,
        name,
      }
    );
  } catch (e) {
    kubevirtConsole.error(e);
    return undefined;
  }
};

export const convertNetworkDataObjectToYAML = (networkData: CloudInitNetworkData): string => {
  const { addresses, gateway4, name } = networkData || {};
  const hasValue = !isEmpty(name) || !isEmpty(addresses) || !isEmpty(gateway4);
  try {
    return hasValue
      ? dump({
          ethernets: {
            [name || '']: {
              addresses: (addresses || '')?.replace(/\s/g, '').split(','),
              ...(gateway4 && { gateway4 }),
            },
          },
          version: 2,
        } as CloudInitNetwork)
      : null;
  } catch (e) {
    kubevirtConsole.error(e);
    return undefined;
  }
};

export const createDefaultCloudInitYAML = () => ({
  networkData: '',
  userData: '',
});

export const updateCloudInitRHELSubscription = (
  vmVolumes: V1Volume[] = [],
  subscriptionData: RHELAutomaticSubscriptionData,
): V1Volume[] => {
  const { activationKey, organizationID } = subscriptionData || {};

  if (isEmpty(organizationID) || isEmpty(activationKey)) {
    return vmVolumes;
  }

  const [cloudInitVol, restVolumes]: [null | V1Volume, V1Volume[]] = vmVolumes.reduce(
    (result, vol) => {
      !isEmpty(getCloudInitData(vol)) ? (result[0] = vol) : result[1].push(vol);
      return result;
    },
    [null, []],
  );

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
    draftCloudInitVolume.cloudInitNoCloud = updatedCloudInitVolumeData;
  });

  return [...restVolumes, updatedCloudInitVolume];
};

export type CloudInitUserData = {
  chpasswd?: { expire?: boolean };
  hostname?: string;
  password: string;
  rh_subscription?: {
    [ACTIVATION_KEY]: string;
    org: string;
  };
  user: string;
};

export type CloudInitNetworkData = {
  addresses: string;
  gateway4: string;
  name: string;
};

type CloudInitNetwork = {
  ethernets: {
    [name: string]: {
      addresses: string[];
      gateway4: string;
    };
  };
  version: number;
};
