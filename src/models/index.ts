import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';

export const VirtualMachineModel: K8sModel = {
  label: 'Virtual Machine',
  labelPlural: 'Virtual Machines',
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachines',
  abbr: 'VM',
  namespaced: true,
  kind: 'VirtualMachine',
  id: 'virtualmachine',
  crd: true,
};

export const VirtualMachineInstanceModel: K8sModel = {
  label: 'Virtual Machine Instance',
  labelPlural: 'Virtual Machine Instances',
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachineinstances',
  abbr: 'VMI',
  namespaced: true,
  kind: 'VirtualMachineInstance',
  id: 'virtualmachineinstance',
  color: '#002F5D',
  crd: true,
};

export const VirtualMachineInstancePresetModel: K8sModel = {
  label: 'Virtual Machine Instance Preset',
  labelPlural: 'Virtual Machine Instance Presets',
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachineinstancepresets',
  abbr: 'VMIP',
  namespaced: true,
  kind: 'VirtualMachineInstancePreset',
  id: 'virtualmachineinstancepreset',
  crd: true,
};

export const VirtualMachineInstanceReplicaSetModel: K8sModel = {
  label: 'Virtual Machine Instance Replica Set',
  labelPlural: 'Virtual Machine Instance Replica Sets',
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachineinstancereplicasets',
  abbr: 'VMIR',
  namespaced: true,
  kind: 'VirtualMachineInstanceReplicaSet',
  id: 'virtualmachineinstancereplicaset',
  crd: true,
};

export const VirtualMachineInstanceMigrationModel: K8sModel = {
  label: 'Virtual Machine Instance Migration',
  labelPlural: 'Virtual Machine Instance Migrations',
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachineinstancemigrations',
  abbr: 'VMIM',
  namespaced: true,
  kind: 'VirtualMachineInstanceMigration',
  id: 'virtualmachineinstancemigration',
  crd: true,
};
