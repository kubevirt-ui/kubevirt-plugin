import produce from 'immer';
import { dump, type LoadOptions } from 'js-yaml';

import {
  type V1CloudInitNoCloudSource,
  type V1VirtualMachine,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { safeYAMLToJS } from '@kubevirt-utils/utils/yaml';
import { AutomaticSubscriptionTypeEnum } from '@settings/tabs/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/components/AutomaticSubscriptionType/utils/utils';

import { AUTO_UPDATE_OS_CMD, CLOUD_CONFIG_HEADER, DNF_AUTOMATIC_PACKAGE } from './constants';
import { type CloudInitNetwork, type CloudInitNetworkData, type CloudInitUserData } from './types';

export type { CloudInitNetworkData, CloudInitUserData } from './types';

export const deleteObjBlankValues = (obj: object = {}): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj)?.filter(([, val]) => !!val));

export const getCloudInitVolume = (vm: V1VirtualMachine): V1Volume => {
  return getVolumes(vm)?.find((vol) => !!vol.cloudInitConfigDrive || !!vol.cloudInitNoCloud);
};

export const getCloudInitData = (cloudInitVolume: V1Volume): V1CloudInitNoCloudSource => {
  return cloudInitVolume?.cloudInitConfigDrive ?? cloudInitVolume?.cloudInitNoCloud;
};

export const convertYAMLUserDataObject = (
  userData: string,
  opts?: LoadOptions,
): CloudInitUserData => {
  return safeYAMLToJS<CloudInitUserData | undefined>(userData, undefined, opts);
};

export const convertUserDataObjectToYAML = (
  userData: CloudInitUserData,
  addHeader: boolean,
): string => {
  try {
    const filteredUser = deleteObjBlankValues(userData);
    const result = dump(filteredUser);
    return addHeader ? `${CLOUD_CONFIG_HEADER}\n${result}` : result;
  } catch (err) {
    kubevirtConsole.error(err);
    return undefined;
  }
};

export const convertYAMLToNetworkDataObject = (
  networkData: string,
): CloudInitNetworkData | undefined => {
  const networkObj = safeYAMLToJS<CloudInitNetwork | undefined>(networkData, undefined);
  if (!networkObj?.ethernets) return undefined;

  const name = Object.keys(networkObj.ethernets)[0];
  if (!name) return undefined;

  const ethernet = networkObj.ethernets[name];
  const rawAddresses = !isEmpty(ethernet?.addresses) ? ethernet.addresses : undefined;
  const addresses = Array.isArray(rawAddresses) ? rawAddresses.join(',') : rawAddresses;
  const gateway4 = ethernet?.gateway4;
  const gateway6 = ethernet?.gateway6;

  const nonEmptyNetworkObj = !!addresses || !!name || !!gateway4 || !!gateway6;
  return nonEmptyNetworkObj ? { addresses, gateway4, gateway6, name } : undefined;
};

export const convertNetworkDataObjectToYAML = (networkData: CloudInitNetworkData): string => {
  const { addresses, gateway4, gateway6, name } = networkData || {};
  const hasValue =
    !isEmpty(name) || !isEmpty(addresses) || !isEmpty(gateway4) || !isEmpty(gateway6);
  try {
    return hasValue
      ? dump({
          ethernets: {
            [name || '']: {
              addresses: (addresses || '')?.replace(/\s/g, '').split(','),
              ...(gateway4 && { gateway4 }),
              ...(gateway6 && { gateway6 }),
            },
          },
          version: 2,
        } as CloudInitNetwork)
      : null;
  } catch (err) {
    kubevirtConsole.error(err);
    return undefined;
  }
};

export const createDefaultCloudInitYAML = (): { networkData: string; userData: string } => ({
  networkData: '',
  userData: '',
});

export const addDNFUpdateToRunCMD = (
  userData: CloudInitUserData,
  autoUpdateEnabled: boolean,
): void => {
  if (autoUpdateEnabled) {
    userData.packages ??= [];
    userData.packages.push(DNF_AUTOMATIC_PACKAGE);

    userData.runcmd ??= [];
    userData.runcmd.push(AUTO_UPDATE_OS_CMD);
  }
};

export const addSubscriptionManagerToRunCMD = (
  userData: CloudInitUserData,
  subscriptionData: RHELAutomaticSubscriptionData,
): void => {
  const subscriptionManagerCMD = [
    `subscription-manager register --org=${subscriptionData.organizationID} --activationkey=${subscriptionData.activationKey}`,
  ];

  if (
    subscriptionData.customUrl &&
    subscriptionData.type !== AutomaticSubscriptionTypeEnum.ENABLE_PREDICTIVE_ANALYTICS
  ) {
    subscriptionManagerCMD.push(` --serverurl=${subscriptionData.customUrl}`);
  }

  if (subscriptionData.type === AutomaticSubscriptionTypeEnum.ENABLE_PREDICTIVE_ANALYTICS) {
    subscriptionManagerCMD.push(' && insights-client --register');
  }

  const command = subscriptionManagerCMD.join(' ');

  userData.runcmd ??= [];
  userData?.runcmd.push(command);
};

export const updateCloudInitRHELSubscription = (
  vmVolumes: V1Volume[] = [],
  subscriptionData: RHELAutomaticSubscriptionData,
  autoUpdateEnabled?: boolean,
): V1Volume[] => {
  const { activationKey, organizationID } = subscriptionData || {};

  if (isEmpty(organizationID) || isEmpty(activationKey)) {
    return vmVolumes;
  }

  const [cloudInitVol, restVolumes] = vmVolumes.reduce<[null | V1Volume, V1Volume[]]>(
    (result, vol) => {
      if (!isEmpty(getCloudInitData(vol))) {
        result[0] = vol;
      } else {
        result[1].push(vol);
      }
      return result;
    },
    [null, []],
  );

  if (!cloudInitVol) return vmVolumes;

  const cloudInitVolData = getCloudInitData(cloudInitVol);
  const userDataObject = convertYAMLUserDataObject(cloudInitVolData?.userData);

  const updatedUserDataObject = produce(userDataObject, (draftUserDataObject) => {
    addSubscriptionManagerToRunCMD(draftUserDataObject, subscriptionData);
    addDNFUpdateToRunCMD(draftUserDataObject, autoUpdateEnabled);
  });

  const updatedCloudInitVolumeData = produce(cloudInitVolData, (draftCloudInitVolumeData) => {
    draftCloudInitVolumeData.userData = convertUserDataObjectToYAML(updatedUserDataObject, true);
  });

  const updatedCloudInitVolume = produce(cloudInitVol, (draftCloudInitVolume) => {
    draftCloudInitVolume.cloudInitNoCloud = updatedCloudInitVolumeData;
  });

  return [...restVolumes, updatedCloudInitVolume];
};
