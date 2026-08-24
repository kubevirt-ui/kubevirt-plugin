import { type V1VirtualMachine, type V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';

import { EnvironmentKind, type EnvironmentVariable } from './constants';

const getKindFromEnvVolume = (volume: V1Volume): EnvironmentKind | null => {
  if (volume.configMap) {
    return EnvironmentKind.configMap;
  }
  if (volume.secret) {
    return EnvironmentKind.secret;
  }
  if (volume.serviceAccount) {
    return EnvironmentKind.serviceAccount;
  }

  return null;
};

export const getVMEnvironmentsVariables = (vm: V1VirtualMachine): EnvironmentVariable[] => {
  const disksWithSerial = (getDisks(vm) ?? []).filter((disk) => disk?.serial);

  return (getVolumes(vm) ?? []).reduce((acc, volume) => {
    const envDisk = disksWithSerial.find((disk) => disk.name === volume.name);

    if (envDisk) {
      acc.push({
        diskName: volume.name,
        kind: getKindFromEnvVolume(volume),
        name:
          volume?.configMap?.name ??
          volume?.secret?.secretName ??
          volume?.serviceAccount?.serviceAccountName,
        serial: envDisk?.serial,
      });
    }

    return acc;
  }, []);
};

export const getRandomSerial = (len = 6): string => {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, len);
};

const getConfigMapVolume = (diskName: string, name: string): V1Volume => ({
  configMap: {
    name,
  },
  name: diskName,
});

const getSecretVolume = (diskName: string, secretName: string): V1Volume => ({
  name: diskName,
  secret: {
    secretName,
  },
});

const getServiceAccountVolume = (diskName: string, serviceAccountName: string): V1Volume => ({
  name: diskName,
  serviceAccount: {
    serviceAccountName,
  },
});

const MapGettersForKind = {
  [EnvironmentKind.configMap]: getConfigMapVolume,
  [EnvironmentKind.secret]: getSecretVolume,
  [EnvironmentKind.serviceAccount]: getServiceAccountVolume,
};

export const updateVolumeForKind = (
  envVolume: V1Volume,
  resourceName: string,
  kind: EnvironmentKind,
): V1Volume => MapGettersForKind[kind](envVolume.name, resourceName);

export const areEnvironmentsChanged = (
  environments: EnvironmentVariable[],
  initialEnvironments: EnvironmentVariable[],
): boolean => {
  const allEnvsInInitial = environments.every(({ name, serial }) =>
    initialEnvironments.find((env) => env.name === name && env.serial === serial),
  );
  return !allEnvsInInitial || environments.length !== initialEnvironments.length;
};

export const getEnvironmentOptionValue = (name: string, kind: EnvironmentKind): null | string =>
  !name ? null : `${kind}:${name}`;

export const getEnvironmentOptionName = (value: string): string => value.split(':').slice(1).join();
export const getEnvironmentOptionKind = (value: string): EnvironmentKind =>
  value.split(':')[0] as EnvironmentKind;
