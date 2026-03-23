import {
  HrefNavItem,
  NavSection,
  ResourceClusterNavItem,
  Separator,
} from '@openshift-console/dynamic-plugin-sdk';
import { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { PERSPECTIVES } from '../../utils/constants/constants';

export const computeSection: EncodedExtension[] = [
  {
    flags: { required: ['CAN_LIST_NODE'] },
    properties: {
      dataAttributes: { 'data-quickstart-id': 'qs-nav-compute' },
      id: 'compute-virt-perspective',
      insertAfter: 'storage-virt-perspective',
      name: '%console-app~Compute%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    properties: {
      id: 'nodes-virt-perspective',
      model: {
        kind: 'Node',
        version: 'v1',
      },
      name: '%console-app~Nodes%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    flags: { required: ['CLUSTER_API'] },
    properties: {
      href: '/k8s/ns/openshift-machine-api/machine.openshift.io~v1beta1~Machine',
      id: 'machines-virt-perspective',
      insertAfter: 'nodes-virt-perspective',
      name: '%console-app~Machines%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: { required: ['CLUSTER_API'] },
    properties: {
      href: '/k8s/ns/openshift-machine-api/machine.openshift.io~v1beta1~MachineSet',
      id: 'machinesets-virt-perspective',
      insertAfter: 'machines-virt-perspective',
      name: '%console-app~MachineSets%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: { required: ['MACHINE_AUTOSCALER'] },
    properties: {
      href: '/k8s/ns/openshift-machine-api/autoscaling.openshift.io~v1beta1~MachineAutoscaler',
      id: 'machzineautoscaler-virt-perspective',
      insertAfter: 'machinesets-virt-perspective',
      name: '%console-app~MachineAutoscalers%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: { required: ['MACHINE_HEALTH_CHECK'] },
    properties: {
      href: '/k8s/ns/openshift-machine-api/machine.openshift.io~v1beta1~MachineHealthCheck',
      id: 'machinehealthchecks-virt-perspective',
      insertAfter: 'machzineautoscaler-virt-perspective',
      name: '%plugin__kubevirt-plugin~MachineHealthChecks%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: { required: ['MACHINE_CONFIG'] },
    properties: {
      id: 'computeseparator-virt-perspective',
      insertAfter: 'machinehealthchecks-virt-perspective',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'compute-virt-perspective',
      testID: 'ComputeSeparator',
    },
    type: 'console.navigation/separator',
  } as EncodedExtension<Separator>,
  {
    flags: { required: ['MACHINE_CONFIG'] },
    properties: {
      id: 'machineconfigs-virt-perspective',
      insertAfter: 'computeseparator-virt-perspective',
      model: {
        group: 'machineconfiguration.openshift.io',
        kind: 'MachineConfig',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~MachineConfigs%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    flags: { required: ['MACHINE_CONFIG'] },
    properties: {
      id: 'machineconfigpools-virt-perspective',
      insertAfter: 'machineconfigs-virt-perspective',
      model: {
        group: 'machineconfiguration.openshift.io',
        kind: 'MachineConfigPool',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~MachineConfigPools%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    properties: {
      href: '/hardwaredevices',
      id: 'hardwaredevices-virt-perspective',
      insertBefore: 'baremetalhosts',
      name: '%plugin__kubevirt-plugin~Hardware Devices%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];
