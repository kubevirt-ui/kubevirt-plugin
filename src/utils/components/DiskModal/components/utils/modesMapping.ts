import { uniq } from 'lodash';

import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';

export const initialAccessModes: V1beta1StorageSpecAccessModesEnum[] = [
  V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
  V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
  V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
];
export const initialVolumeModes: V1beta1StorageSpecVolumeModeEnum[] = [
  V1beta1StorageSpecVolumeModeEnum.Filesystem,
  V1beta1StorageSpecVolumeModeEnum.Block,
];

type ModeMapping = {
  [volumeMode in V1beta1StorageSpecVolumeModeEnum]?: V1beta1StorageSpecAccessModesEnum[];
};

type ProvisionerAccessModeMapping = {
  [provisioner: string]: ModeMapping;
};

// See https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes for more details
export const provisionerAccessModeMapping: ProvisionerAccessModeMapping = {
  'cinder.csi.openstack.org': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [V1beta1StorageSpecAccessModesEnum.ReadWriteOnce],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
    ],
  },
  'csi.ovirt.org': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [V1beta1StorageSpecAccessModesEnum.ReadWriteOnce],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
    ],
  },
  'ebs.csi.aws.com': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [V1beta1StorageSpecAccessModesEnum.ReadWriteOnce],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
    ],
  },
  'kubernetes.io/aws-ebs': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [V1beta1StorageSpecAccessModesEnum.ReadWriteOnce],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
    ],
  },
  'kubernetes.io/azure-disk': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [V1beta1StorageSpecAccessModesEnum.ReadWriteOnce],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
    ],
  },
  'kubernetes.io/azure-file': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
  },
  'kubernetes.io/cinder': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [V1beta1StorageSpecAccessModesEnum.ReadWriteOnce],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
    ],
  },
  'kubernetes.io/gce-pd': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
  },
  'kubernetes.io/glusterfs': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
  },
  'kubernetes.io/no-provisioner': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [V1beta1StorageSpecAccessModesEnum.ReadWriteOnce],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
    ],
  },
  'kubernetes.io/portworx-volume': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
    ],
  },
  'kubernetes.io/quobyte': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
  },
  'kubernetes.io/rbd': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
  },
  'kubernetes.io/scaleio': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
  },
  'kubernetes.io/storageos': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [V1beta1StorageSpecAccessModesEnum.ReadWriteOnce],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
    ],
  },
  'kubernetes.io/vsphere-volume': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
    ],
  },
  // Since 4.6 new provisioners names will be without the 'kubernetes.io/' prefix.
  'manila.csi.openstack.org': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
  },
  'openshift-storage.cephfs.csi.ceph.com': {
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
  },
  'openshift-storage.rbd.csi.ceph.com': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
      V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
    ],
  },
  'pd.csi.storage.gke.io': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [V1beta1StorageSpecAccessModesEnum.ReadWriteOnce],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
    ],
  },
};

export const ACCESS_MODE_RADIO_OPTIONS = [
  {
    label: t('Single user (RWO)'),
    value: V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
  },
  {
    label: t('Shared access (RWX)'),
    value: V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
  },
  {
    label: t('Read only (ROX)'),
    value: V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
  },
];

export const VOLUME_MODE_RADIO_OPTIONS = [
  {
    label: t('Filesystem'),
    value: V1beta1StorageSpecVolumeModeEnum.Filesystem,
  },
  {
    label: t('Block'),
    value: V1beta1StorageSpecVolumeModeEnum.Block,
  },
];

export const getAccessModeForProvisioner = (
  provisioner: string,
  volumeMode: V1beta1StorageSpecVolumeModeEnum,
) => {
  const modeMap = provisionerAccessModeMapping[provisioner] || {};

  const volumeModes = Object.keys(modeMap) as V1beta1StorageSpecAccessModesEnum[];
  if (volumeModes?.length > 0) {
    return volumeMode ? modeMap[volumeMode] : volumeModes.map((mode) => modeMap[mode]).flat();
  }

  return initialAccessModes;
};

export const getVolumeModeForProvisioner = (
  provisioner: string,
  accessMode: V1beta1StorageSpecAccessModesEnum,
) => {
  const modeMap = provisionerAccessModeMapping[provisioner] || {};

  const volumeModes = Object.keys(modeMap) as V1beta1StorageSpecVolumeModeEnum[];
  if (volumeModes?.length > 0) {
    return accessMode
      ? volumeModes.filter((vMode) => modeMap[vMode].includes(accessMode))
      : volumeModes;
  }

  return initialVolumeModes;
};

export const getAccessModesForVolume = (
  claimPropertySets: ClaimPropertySets,
  volumeMode?: string,
) =>
  uniq(
    claimPropertySets
      .filter((it) => it.volumeMode === volumeMode)
      .flatMap((it) => it.accessModes)
      .filter(Boolean)
      .map((mode) => V1beta1StorageSpecAccessModesEnum[mode])
      .filter(Boolean),
  );
