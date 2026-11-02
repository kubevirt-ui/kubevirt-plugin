import type { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { Template } from '@kubevirt-utils/resources/template/utils';
import type { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';

import { sceneRunningVirtualMachine } from './story-vm-detail-fixtures';

export const SCENE_TEMPLATE_NAME = 'scene-rhel-template';
export const SCENE_BOOTABLE_VOLUME_NAME = 'scene-bootable-volume';
export const SCENE_CLUSTER_INSTANCETYPE_NAME = 'scene-u1-small';
export const SCENE_VM_NAME = sceneRunningVirtualMachine.metadata?.name ?? 'story-vm';

/** OpenShift template fixture for wizard gallery catalog stubs. */
export const sceneTemplate = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: {
    labels: {
      'os.template.kubevirt.io/rhel9.5': 'true',
    },
    name: SCENE_TEMPLATE_NAME,
    namespace: 'openshift',
  },
  objects: [],
} as unknown as Template;

export const sceneBootableVolume: BootableVolume = {
  apiVersion: 'v1',
  kind: 'PersistentVolumeClaim',
  metadata: {
    labels: {
      'instancetype.kubevirt.io/default-preference': 'rhel.9',
    },
    name: SCENE_BOOTABLE_VOLUME_NAME,
    namespace: 'openshift-virtualization-os-images',
  },
};

export const sceneClusterInstancetype: V1beta1VirtualMachineClusterInstancetype = {
  apiVersion: 'instancetype.kubevirt.io/v1beta1',
  kind: 'VirtualMachineClusterInstancetype',
  metadata: {
    name: SCENE_CLUSTER_INSTANCETYPE_NAME,
  },
  spec: {
    cpu: { guest: 1 },
    memory: { guest: '2Gi' },
  },
};

export const scenePopulatedVirtualMachines = [sceneRunningVirtualMachine];
