import {
  ProviderModel,
  StorageMapModel,
  type V1beta1StorageMap,
  type V1beta1StorageMapSpecMap,
} from '@forklift-ui/types';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { CCLM_LABEL_KEY, CCLM_LABEL_VALUE, MTV_MIGRATION_NAMESPACE } from './constants';
import { type GetInitialStorageMapParams } from './types';

const getVolumePVCs = (vm: V1VirtualMachine): (string | undefined)[] | undefined =>
  getVolumes(vm)?.map(
    (volume) => volume?.persistentVolumeClaim?.claimName ?? volume?.dataVolume?.name,
  );

export const getInitialStorageMap = ({
  pvcs,
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
      labels: {
        [CCLM_LABEL_KEY]: CCLM_LABEL_VALUE,
      },
      name: `cross-cluster-migration-${getRandomChars()}`,
      namespace: MTV_MIGRATION_NAMESPACE,
    },
    spec: {
      map: storageClasses.map((storageClass): V1beta1StorageMapSpecMap => {
        return {
          destination: {
            storageClass: getName(
              targetStorageClasses.find(
                (targetStorageClass) => getName(targetStorageClass) === storageClass,
              ),
            ),
          },
          source: {
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
