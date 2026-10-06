import type { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

const INSTANCETYPE_CLASS_ANNOTATION = 'instancetype.kubevirt.io/class';
const INSTANCETYPE_VENDOR_LABEL = 'instancetype.kubevirt.io/vendor';

export const sceneWizardU1Small: V1beta1VirtualMachineClusterInstancetype = {
  apiVersion: 'instancetype.kubevirt.io/v1beta1',
  kind: 'VirtualMachineClusterInstancetype',
  metadata: {
    annotations: {
      [INSTANCETYPE_CLASS_ANNOTATION]: 'u1',
    },
    labels: {
      [INSTANCETYPE_VENDOR_LABEL]: 'kubevirt.io',
    },
    name: 'u1.small',
  },
  spec: {
    cpu: { guest: 1 },
    memory: { guest: '2Gi' },
  },
};

export const sceneWizardU1Medium: V1beta1VirtualMachineClusterInstancetype = {
  ...sceneWizardU1Small,
  metadata: {
    ...sceneWizardU1Small.metadata,
    name: 'u1.medium',
  },
  spec: {
    cpu: { guest: 2 },
    memory: { guest: '4Gi' },
  },
};

export const sceneWizardRhelPreference: V1beta1VirtualMachineClusterPreference = {
  apiVersion: 'instancetype.kubevirt.io/v1beta1',
  kind: 'VirtualMachineClusterPreference',
  metadata: {
    name: 'rhel.9',
  },
  spec: {},
};

export const sceneWizardClusterInstanceTypes = [sceneWizardU1Small, sceneWizardU1Medium];
