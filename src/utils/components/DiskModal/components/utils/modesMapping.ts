import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

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
