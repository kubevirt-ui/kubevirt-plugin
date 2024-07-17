import { V1beta1StorageSpecVolumeModeEnum } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export enum ACCESS_MODES {
  ROX = 'ReadOnlyMany',
  RWO = 'ReadWriteOnce',
  RWX = 'ReadWriteMany',
}

export const initialAccessModes: ACCESS_MODES[] = [
  ACCESS_MODES.RWX,
  ACCESS_MODES.RWO,
  ACCESS_MODES.ROX,
];
export const initialVolumeModes: V1beta1StorageSpecVolumeModeEnum[] = [
  V1beta1StorageSpecVolumeModeEnum.Filesystem,
  V1beta1StorageSpecVolumeModeEnum.Block,
];

type ModeMapping = {
  [volumeMode in V1beta1StorageSpecVolumeModeEnum]?: ACCESS_MODES[];
};

type ProvisionerAccessModeMapping = {
  [provisioner: string]: ModeMapping;
};

// See https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes for more details
export const provisionerAccessModeMapping: ProvisionerAccessModeMapping = {
  'cinder.csi.openstack.org': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO],
  },
  'csi.ovirt.org': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO],
  },
  'ebs.csi.aws.com': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/aws-ebs': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/azure-disk': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/azure-file': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      ACCESS_MODES.RWO,
      ACCESS_MODES.RWX,
      ACCESS_MODES.ROX,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      ACCESS_MODES.RWO,
      ACCESS_MODES.RWX,
      ACCESS_MODES.ROX,
    ],
  },
  'kubernetes.io/cinder': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/gce-pd': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'kubernetes.io/glusterfs': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      ACCESS_MODES.RWO,
      ACCESS_MODES.RWX,
      ACCESS_MODES.ROX,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      ACCESS_MODES.RWO,
      ACCESS_MODES.RWX,
      ACCESS_MODES.ROX,
    ],
  },
  'kubernetes.io/no-provisioner': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/portworx-volume': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
  },
  'kubernetes.io/quobyte': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      ACCESS_MODES.RWO,
      ACCESS_MODES.RWX,
      ACCESS_MODES.ROX,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      ACCESS_MODES.RWO,
      ACCESS_MODES.RWX,
      ACCESS_MODES.ROX,
    ],
  },
  'kubernetes.io/rbd': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'kubernetes.io/scaleio': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'kubernetes.io/storageos': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/vsphere-volume': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
  },
  // Since 4.6 new provisioners names will be without the 'kubernetes.io/' prefix.
  'manila.csi.openstack.org': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      ACCESS_MODES.RWO,
      ACCESS_MODES.RWX,
      ACCESS_MODES.ROX,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      ACCESS_MODES.RWO,
      ACCESS_MODES.RWX,
      ACCESS_MODES.ROX,
    ],
  },
  'openshift-storage.cephfs.csi.ceph.com': {
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [
      ACCESS_MODES.RWO,
      ACCESS_MODES.RWX,
      ACCESS_MODES.ROX,
    ],
  },
  'openshift-storage.rbd.csi.ceph.com': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [
      ACCESS_MODES.RWO,
      ACCESS_MODES.RWX,
      ACCESS_MODES.ROX,
    ],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'pd.csi.storage.gke.io': {
    [V1beta1StorageSpecVolumeModeEnum.Block]: [ACCESS_MODES.RWO],
    [V1beta1StorageSpecVolumeModeEnum.Filesystem]: [ACCESS_MODES.RWO],
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

  const volumeModes = Object.keys(modeMap) as ACCESS_MODES[];
  if (volumeModes?.length > 0) {
    return volumeMode ? modeMap[volumeMode] : volumeModes.map((mode) => modeMap[mode]).flat();
  }

  return initialAccessModes;
};

export const getVolumeModeForProvisioner = (provisioner: string, accessMode: ACCESS_MODES) => {
  const modeMap = provisionerAccessModeMapping[provisioner] || {};

  const volumeModes = Object.keys(modeMap) as V1beta1StorageSpecVolumeModeEnum[];
  if (volumeModes?.length > 0) {
    return accessMode
      ? volumeModes.filter((vMode) => modeMap[vMode].includes(accessMode))
      : volumeModes;
  }

  return initialVolumeModes;
};
