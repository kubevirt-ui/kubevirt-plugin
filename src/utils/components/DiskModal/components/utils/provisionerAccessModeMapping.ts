import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

type ModeMapping = {
  [volumeMode in V1beta1StorageSpecVolumeModeEnum]?: V1beta1StorageSpecAccessModesEnum[];
};

type ProvisionerAccessModeMapping = {
  [provisioner: string]: ModeMapping;
};

const { ReadOnlyMany, ReadWriteMany, ReadWriteOnce } = V1beta1StorageSpecAccessModesEnum;
const { Block, Filesystem } = V1beta1StorageSpecVolumeModeEnum;

// See https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes for more details
export const provisionerAccessModeMapping: ProvisionerAccessModeMapping = {
  'cinder.csi.openstack.org': {
    [Block]: [ReadWriteOnce],
    [Filesystem]: [ReadWriteOnce],
  },
  'csi.ovirt.org': {
    [Block]: [ReadWriteOnce],
    [Filesystem]: [ReadWriteOnce],
  },
  'ebs.csi.aws.com': {
    [Block]: [ReadWriteOnce],
    [Filesystem]: [ReadWriteOnce],
  },
  'kubernetes.io/aws-ebs': {
    [Block]: [ReadWriteOnce],
    [Filesystem]: [ReadWriteOnce],
  },
  'kubernetes.io/azure-disk': {
    [Block]: [ReadWriteOnce],
    [Filesystem]: [ReadWriteOnce],
  },
  'kubernetes.io/azure-file': {
    [Block]: [ReadWriteOnce, ReadWriteMany, ReadOnlyMany],
    [Filesystem]: [ReadWriteOnce, ReadWriteMany, ReadOnlyMany],
  },
  'kubernetes.io/cinder': {
    [Block]: [ReadWriteOnce],
    [Filesystem]: [ReadWriteOnce],
  },
  'kubernetes.io/gce-pd': {
    [Block]: [ReadWriteOnce, ReadOnlyMany],
    [Filesystem]: [ReadWriteOnce, ReadOnlyMany],
  },
  'kubernetes.io/glusterfs': {
    [Block]: [ReadWriteOnce, ReadWriteMany, ReadOnlyMany],
    [Filesystem]: [ReadWriteOnce, ReadWriteMany, ReadOnlyMany],
  },
  'kubernetes.io/no-provisioner': {
    [Block]: [ReadWriteOnce],
    [Filesystem]: [ReadWriteOnce],
  },
  'kubernetes.io/portworx-volume': {
    [Block]: [ReadWriteOnce, ReadWriteMany],
    [Filesystem]: [ReadWriteOnce, ReadWriteMany],
  },
  'kubernetes.io/quobyte': {
    [Block]: [ReadWriteOnce, ReadWriteMany, ReadOnlyMany],
    [Filesystem]: [ReadWriteOnce, ReadWriteMany, ReadOnlyMany],
  },
  'kubernetes.io/rbd': {
    [Block]: [ReadWriteOnce, ReadOnlyMany],
    [Filesystem]: [ReadWriteOnce, ReadOnlyMany],
  },
  'kubernetes.io/scaleio': {
    [Block]: [ReadWriteOnce, ReadOnlyMany],
    [Filesystem]: [ReadWriteOnce, ReadOnlyMany],
  },
  'kubernetes.io/storageos': {
    [Block]: [ReadWriteOnce],
    [Filesystem]: [ReadWriteOnce],
  },
  'kubernetes.io/vsphere-volume': {
    [Block]: [ReadWriteOnce, ReadWriteMany],
    [Filesystem]: [ReadWriteOnce, ReadWriteMany],
  },
  // Since 4.6 new provisioners names will be without the 'kubernetes.io/' prefix.
  'manila.csi.openstack.org': {
    [Block]: [ReadWriteOnce, ReadWriteMany, ReadOnlyMany],
    [Filesystem]: [ReadWriteOnce, ReadWriteMany, ReadOnlyMany],
  },
  'openshift-storage.cephfs.csi.ceph.com': {
    [Filesystem]: [ReadWriteOnce, ReadWriteMany, ReadOnlyMany],
  },
  'openshift-storage.rbd.csi.ceph.com': {
    [Block]: [ReadWriteOnce, ReadWriteMany, ReadOnlyMany],
    [Filesystem]: [ReadWriteOnce, ReadOnlyMany],
  },
  'pd.csi.storage.gke.io': {
    [Block]: [ReadWriteOnce],
    [Filesystem]: [ReadWriteOnce],
  },
};
