import {
  NetworkMapModel,
  PlanModel,
  ProviderModel,
  StorageMapModel,
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
  V1beta1StorageMapSpecMap,
} from '@kubev2v/types';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NetworkAttachmentDefinition } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { getNetworks, getVolumes } from '@kubevirt-utils/resources/vm';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { HOST_PROVIDER_NAME } from './hooks/constants';
import { MTV_MIGRATION_NAMESPACE, POD_NETWORK_TYPE } from './constants';
import { GetInitialStorageMapParams } from './types';

export const getInitialMigrationPlan = (vms: V1VirtualMachine[]): V1beta1Plan => ({
  apiVersion: `${PlanModel.apiGroup}/${PlanModel.apiVersion}`,
  kind: PlanModel.kind,
  metadata: {
    name: `cross-cluster-migration-${getRandomChars()}`,
    namespace: MTV_MIGRATION_NAMESPACE,
  },
  spec: {
    map: {
      network: null,
      storage: null,
    },
    provider: {
      destination: {
        apiVersion: `${ProviderModel.apiGroup}/${ProviderModel.apiVersion}`,
        kind: ProviderModel.kind,
        namespace: MTV_MIGRATION_NAMESPACE,
      },
      source: {
        apiVersion: `${ProviderModel.apiGroup}/${ProviderModel.apiVersion}`,
        kind: ProviderModel.kind,
        name: null,
        namespace: MTV_MIGRATION_NAMESPACE,
      },
    },
    targetNamespace: null,
    vms: vms.map((vm) => ({
      id: getUID(vm),
      name: getName(vm),
      namespace: getNamespace(vm),
    })),
  },
});

export const getNADNameAndNamespace = (nad: string, defaultNamespace?: string) => {
  const splittedName = nad.split('/');

  const nadNamespace = splittedName.length > 1 ? splittedName[0] : defaultNamespace;
  const nadName = splittedName.length > 1 ? splittedName[1] : nad;

  return {
    name: nadName,
    namespace: nadNamespace,
  };
};

export const getInitialNetworkMap = (
  vms: V1VirtualMachine[],
  targetNADs: NetworkAttachmentDefinition[],
): V1beta1NetworkMap => {
  const sourceNamespace = getNamespace(vms?.[0]);
  const networks = vms
    .map((vm) => getNetworks(vm)?.filter((network) => network.multus?.networkName))
    .filter(Boolean)
    .flat();

  return {
    apiVersion: `${NetworkMapModel.apiGroup}/${NetworkMapModel.apiVersion}`,
    kind: NetworkMapModel.kind,
    metadata: {
      name: `cross-cluster-migration-${getRandomChars()}`,
      namespace: MTV_MIGRATION_NAMESPACE,
    },
    spec: {
      map: [
        {
          destination: {
            type: POD_NETWORK_TYPE,
          },
          source: {
            type: POD_NETWORK_TYPE,
          },
        },
        ...networks.map((network): V1beta1NetworkMapSpecMap => {
          const { name, namespace } = getNADNameAndNamespace(
            network?.multus?.networkName,
            sourceNamespace,
          );

          const targetNAD = targetNADs.find(
            (nad) => getName(nad) === name && getNamespace(nad) === namespace,
          );

          return {
            destination: {
              name: getName(targetNAD),
              namespace: getNamespace(targetNAD),
              type: 'multus',
            },
            source: {
              name: name,
              namespace: namespace,
              type: 'multus',
            },
          };
        }),
      ],

      provider: {
        destination: {
          apiVersion: `${ProviderModel.apiGroup}/${ProviderModel.apiVersion}`,
          kind: ProviderModel.kind,
          namespace: MTV_MIGRATION_NAMESPACE,
        },
        source: {
          apiVersion: `${ProviderModel.apiGroup}/${ProviderModel.apiVersion}`,
          kind: ProviderModel.kind,
          namespace: MTV_MIGRATION_NAMESPACE,
        },
      },
    },
  };
};

const getVolumePVCs = (vm: V1VirtualMachine) =>
  getVolumes(vm)
    ?.map((volume) => volume?.persistentVolumeClaim?.claimName || volume?.dataVolume?.name)
    .filter(Boolean);

export const getInitialStorageMap = ({
  pvcs,
  sourceStorageClasses,
  targetStorageClasses,
  vms,
}: GetInitialStorageMapParams): V1beta1StorageMap => {
  const vmPVCs = vms.map((vm) => getVolumePVCs(vm)).flat();

  const storageClasses = Array.from(
    new Set(
      pvcs
        .filter((pvc) => vmPVCs.includes(getName(pvc)))
        .map((pvc) => pvc.spec.storageClassName)
        .filter(Boolean),
    ),
  );

  return {
    apiVersion: `${StorageMapModel.apiGroup}/${StorageMapModel.apiVersion}`,
    kind: StorageMapModel.kind,
    metadata: {
      name: `cross-cluster-migration-${getRandomChars()}`,
      namespace: MTV_MIGRATION_NAMESPACE,
    },
    spec: {
      map: storageClasses.map((storageClass): V1beta1StorageMapSpecMap => {
        return {
          destination: {
            storageClass: getName(targetStorageClasses.find((sc) => getName(sc) === storageClass)),
          },
          source: {
            id: getUID(sourceStorageClasses.find((sc) => getName(sc) === storageClass)),
            name: storageClass,
          },
        };
      }),

      provider: {
        destination: {
          apiVersion: `${ProviderModel.apiGroup}/${ProviderModel.apiVersion}`,
          kind: ProviderModel.kind,
          namespace: MTV_MIGRATION_NAMESPACE,
        },
        source: {
          apiVersion: `${ProviderModel.apiGroup}/${ProviderModel.apiVersion}`,
          kind: ProviderModel.kind,
          namespace: MTV_MIGRATION_NAMESPACE,
        },
      },
    },
  };
};

export const getClusterMajorMinorVersion = (clusterVersion: string) => {
  if (!clusterVersion) return null;

  const version = clusterVersion?.split('.');
  return version.length > 1 ? version[0] + '.' + version[1] : version[0];
};

export const getClusterFromProvider = (provider: string, hubClusterName: string) => {
  if (provider === HOST_PROVIDER_NAME) {
    return hubClusterName;
  }

  return provider?.replace(/-mtv$/, '');
};

export const getProviderNameFromCluster = (cluster: string) => {
  if (!cluster) return '';

  return cluster + '-mtv';
};

export const getProviderByClusterName = (
  cluster: string,
  hubClusterName: string,
  providers: V1beta1Provider[],
) => {
  if (cluster === hubClusterName) {
    return providers?.find((provider) => getName(provider) === HOST_PROVIDER_NAME);
  }

  return providers?.find((provider) => getName(provider) === getProviderNameFromCluster(cluster));
};
