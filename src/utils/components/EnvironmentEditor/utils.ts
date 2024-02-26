import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { SelectOptionObject } from '@patternfly/react-core/deprecated';

import { EnvironmentKind, EnvironmentVariable } from './constants';

const getKindFromEnvVolume = (volume: V1Volume): EnvironmentKind | null => {
  if (volume.configMap) return EnvironmentKind.configMap;
  if (volume.secret) return EnvironmentKind.secret;
  if (volume.serviceAccount) return EnvironmentKind.serviceAccount;

  return null;
};

export const getVMEnvironmentsVariables = (vm: V1VirtualMachine): EnvironmentVariable[] => {
  const disksWithSerial = (getDisks(vm) || []).filter((disk) => disk?.serial);

  return (getVolumes(vm) || []).reduce((acc, volume) => {
    const envDisk = disksWithSerial.find((disk) => disk.name === volume.name);

    if (envDisk)
      acc.push({
        diskName: volume.name,
        kind: getKindFromEnvVolume(volume),
        name:
          volume?.configMap?.name ||
          volume?.secret?.secretName ||
          volume?.serviceAccount?.serviceAccountName,
        serial: envDisk?.serial,
      });

    return acc;
  }, []);
};

export const getRandomSerial = (len = 6): string => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z0-9]+/g, '')
    .substr(1, len);
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
) => MapGettersForKind[kind](envVolume.name, resourceName);

export const areEnvironmentsChanged = (
  environments: EnvironmentVariable[],
  initialEnvironments: EnvironmentVariable[],
): boolean => {
  const allEnvsInInitial = environments.every(({ name, serial }) =>
    initialEnvironments.find((e) => e.name === name && e.serial === serial),
  );
  return !allEnvsInInitial || environments.length !== initialEnvironments.length;
};

export class EnvironmentOption implements SelectOptionObject {
  private kind: EnvironmentKind;
  private name: string;

  toString = (): string => this.name;

  constructor(name: string, kind: EnvironmentKind) {
    this.name = name;
    this.kind = kind;
  }

  getKind() {
    return this.kind;
  }

  getName() {
    return this.name;
  }
}
