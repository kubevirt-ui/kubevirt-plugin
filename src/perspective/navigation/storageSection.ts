import {
  NavSection,
  ResourceClusterNavItem,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { PERSPECTIVES } from '../../utils/constants/constants';

export const storageSection: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: { 'data-quickstart-id': 'qs-nav-storage' },
      id: 'storage-virt-perspective',
      insertAfter: 'networking-virt-perspective',
      name: '%plugin__kubevirt-plugin~Storage%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    flags: {
      required: ['CAN_LIST_VSC'],
    },
    properties: {
      id: 'volumesnapshotcontents-virt-perspective',
      insertAfter: 'volumesnapshotclasses-virt-perspective',
      model: {
        group: 'snapshot.storage.k8s.io',
        kind: 'VolumeSnapshotContent',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~VolumeSnapshotContents%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'storage-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,

  {
    flags: { required: ['CAN_LIST_PV'] },
    properties: {
      id: 'persistentvolumes-virt-perspective',
      model: {
        kind: 'PersistentVolume',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~PersistentVolumes%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'storage-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    properties: {
      id: 'persistentvolumeclaims-virt-perspective',
      insertAfter: 'persistentvolumes-virt-perspective',
      model: {
        kind: 'PersistentVolumeClaim',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~PersistentVolumeClaims%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'storage-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    properties: {
      id: 'storageclasses-virt-perspective',
      insertAfter: 'persistentvolumeclaims-virt-perspective',
      model: {
        group: 'storage.k8s.io',
        kind: 'StorageClass',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~StorageClasses%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'storage-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    properties: {
      id: 'volumesnapshots-virt-perspective',
      insertAfter: 'storageclasses-virt-perspective',
      model: {
        group: 'snapshot.storage.k8s.io',
        kind: 'VolumeSnapshot',
        version: 'v1',
      },
      name: '%console-app~VolumeSnapshots%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'storage-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
  {
    properties: {
      id: 'volumesnapshotclasses-virt-perspective',
      insertAfter: 'volumesnapshots-virt-perspective',
      model: {
        group: 'snapshot.storage.k8s.io',
        kind: 'VolumeSnapshotClass',
        version: 'v1',
      },
      name: '%console-app~VolumeSnapshotClasses%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'storage-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
];
