import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { V1Disk, V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getConfigMaps,
  getDisks,
  getSecrets,
  getServiceAccounts,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { SelectOptionObject } from '@patternfly/react-core';

import { EnvironmentKind, EnvironmentVariable } from './constants';

export const getVMEnvironmentsVariables = (vm: V1VirtualMachine): EnvironmentVariable[] => {
  const disksWithSerial = getDisks(vm)?.filter((disk) => disk.serial);

  return []
    .concat(
      getConfigMaps(vm).map((volume): EnvironmentVariable => {
        const diskEnvironment = disksWithSerial.find((disk) => disk.name === volume.name);
        return {
          name: volume.configMap.name,
          serial: diskEnvironment.serial,
          kind: EnvironmentKind.configMap,
        };
      }),
    )
    .concat(
      getSecrets(vm).map((volume): EnvironmentVariable => {
        const diskEnvironment = disksWithSerial.find((disk) => disk.name === volume.name);
        return {
          name: volume.secret.secretName,
          serial: diskEnvironment.serial,
          kind: EnvironmentKind.secret,
        };
      }),
    )
    .concat(
      getServiceAccounts(vm).map((volume): EnvironmentVariable => {
        const diskEnvironment = disksWithSerial.find((disk) => disk.name === volume.name);
        return {
          name: volume.serviceAccount.serviceAccountName,
          serial: diskEnvironment.serial,
          kind: EnvironmentKind.serviceAccount,
        };
      }),
    );
};

export const getRandomSerial = (len = 6): string => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z0-9]+/g, '')
    .substr(1, len);
};

const getConfigMapVolume = (diskName: string, name: string): V1Volume => ({
  name: diskName,
  configMap: {
    name,
  },
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

export const addEnvironmentsToVM = (
  vm: V1VirtualMachine,
  environments: EnvironmentVariable[],
): V1VirtualMachine => {
  return produceVMDisks(vm, (draftVM) => {
    const currentOtherDisks: V1Disk[] = getDisks(draftVM)?.filter((disk) => !disk.serial);

    const currentOtherVolumes: V1Volume[] = getVolumes(draftVM)?.filter(
      (volume) => !volume.secret && !volume.configMap && !volume.serviceAccount,
    );

    let newSourcesDisks: V1Disk[] = [];
    let newSourcesVolumes: V1Volume[] = [];
    environments.forEach((environment) => {
      const diskName = environment.name + '-disk';

      const newDisk: V1Disk = {
        serial: environment.serial,
        name: diskName,
        disk: {},
      };

      const newVolume: V1Volume = MapGettersForKind[environment.kind](diskName, environment.name);

      newSourcesDisks.push(newDisk);
      newSourcesVolumes.push(newVolume);
    });

    newSourcesDisks = [...currentOtherDisks, ...newSourcesDisks];
    newSourcesVolumes = [...currentOtherVolumes, ...newSourcesVolumes];

    draftVM.spec.template.spec.domain.devices.disks = newSourcesDisks;
    draftVM.spec.template.spec.volumes = newSourcesVolumes;
  });
};

export class EnvironmentOption implements SelectOptionObject {
  private name: string;
  private kind: EnvironmentKind;

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

  toString = (): string => this.name;
}
