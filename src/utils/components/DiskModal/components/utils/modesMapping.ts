import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export enum ACCESS_MODES {
  ROX = 'ReadOnlyMany',
  RWO = 'ReadWriteOnce',
  RWX = 'ReadWriteMany',
}

export enum VOLUME_MODES {
  BLOCK = 'Block',
  FILESYSTEM = 'Filesystem',
}

export const initialAccessModes: ACCESS_MODES[] = [
  ACCESS_MODES.RWX,
  ACCESS_MODES.RWO,
  ACCESS_MODES.ROX,
];
export const initialVolumeModes: VOLUME_MODES[] = [VOLUME_MODES.FILESYSTEM, VOLUME_MODES.BLOCK];

type ModeMapping = {
  [volumeMode in VOLUME_MODES]?: ACCESS_MODES[];
};

type ProvisionerAccessModeMapping = {
  [provisioner: string]: ModeMapping;
};

// See https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes for more details
export const provisionerAccessModeMapping: ProvisionerAccessModeMapping = {
  'cinder.csi.openstack.org': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
  },
  'csi.ovirt.org': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
  },
  'ebs.csi.aws.com': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/aws-ebs': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/azure-disk': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/azure-file': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
  'kubernetes.io/cinder': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/gce-pd': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'kubernetes.io/glusterfs': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
  'kubernetes.io/no-provisioner': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/portworx-volume': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
  },
  'kubernetes.io/quobyte': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
  'kubernetes.io/rbd': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'kubernetes.io/scaleio': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'kubernetes.io/storageos': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/vsphere-volume': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
  },
  // Since 4.6 new provisioners names will be without the 'kubernetes.io/' prefix.
  'manila.csi.openstack.org': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
  'openshift-storage.cephfs.csi.ceph.com': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
  'openshift-storage.rbd.csi.ceph.com': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'pd.csi.storage.gke.io': {
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
  },
};

export const ACCESS_MODE_RADIO_OPTIONS = [
  {
    label: t('Single user (RWO)'),
    value: ACCESS_MODES.RWO,
  },
  {
    label: t('Shared access (RWX)'),
    value: ACCESS_MODES.RWX,
  },
  {
    label: t('Read only (ROX)'),
    value: ACCESS_MODES.ROX,
  },
];

export const VOLUME_MODE_RADIO_OPTIONS = [
  {
    label: t('Filesystem'),
    value: VOLUME_MODES.FILESYSTEM,
  },
  {
    label: t('Block'),
    value: VOLUME_MODES.BLOCK,
  },
];

export const getAccessModeForProvisioner = (provisioner: string, volumeMode: VOLUME_MODES) => {
  const modeMap = provisionerAccessModeMapping[provisioner] || {};

  const volumeModes = Object.keys(modeMap) as ACCESS_MODES[];
  if (volumeModes?.length > 0) {
    return volumeMode ? modeMap[volumeMode] : volumeModes.map((mode) => modeMap[mode]).flat();
  }

  return initialAccessModes;
};

export const getVolumeModeForProvisioner = (provisioner: string, accessMode: ACCESS_MODES) => {
  const modeMap = provisionerAccessModeMapping[provisioner] || {};

  const volumeModes = Object.keys(modeMap) as VOLUME_MODES[];
  if (volumeModes?.length > 0) {
    return accessMode
      ? volumeModes.filter((vMode) => modeMap[vMode].includes(accessMode))
      : volumeModes;
  }

  return initialVolumeModes;
};
