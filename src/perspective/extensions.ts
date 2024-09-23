import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  HrefNavItem,
  NavSection,
  ResourceClusterNavItem,
  Separator,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  perspective: './perspective/perspective.ts',
};

const virtualizationSection = [
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-virtualization-catalog',
        'data-test-id': 'virtualization-catalog-nav-item',
      },
      href: 'catalog',
      id: 'virtualization-catalog-virt-perspective',
      insertBefore: 'virtualmachines',
      name: '%plugin__kubevirt-plugin~Catalog%',
      perspective: 'virtualization-perspective',
      prefixNamespaced: true,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-virtualmachines',
        'data-test-id': 'virtualmachines-nav-item',
      },
      id: 'virtualmachines-virt-perspective',
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~VirtualMachines%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-templates',
        'data-test-id': 'templates-nav-item',
      },
      id: 'templates-virt-perspective',
      model: {
        group: 'template.openshift.io',
        kind: 'Template',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~Templates%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    flags: {
      required: ['KUBEVIRT_INSTANCETYPES'],
    },
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-virtualmachineclusterinstancetypes',
        'data-test-id': 'virtualmachineclusterinstancetypes-nav-item',
      },
      id: 'virtualmachineclusterinstancetypes-virt-perspective',
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterInstancetype',
        version: 'v1beta1',
      },
      name: '%plugin__kubevirt-plugin~InstanceTypes%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_PREFERENCES'],
    },
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-virtualmachineclusterpreferences',
        'data-test-id': 'virtualmachineclusterpreferences-nav-item',
      },
      id: 'virtualmachineclusterpreferences-virt-perspective',
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterPreference',
        version: 'v1beta1',
      },
      name: '%plugin__kubevirt-plugin~Preferences%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    flags: {
      required: ['OPENSHIFT'],
    },
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-virtualization-overview',
        'data-test-id': 'virtualization-overview-nav-item',
      },
      href: 'virtualization-overview',
      id: 'overview-virt-perspective',
      insertBefore: 'virtualization-catalog-virt-perspective',
      name: '%plugin__kubevirt-plugin~Overview%',
      perspective: 'virtualization-perspective',
      prefixNamespaced: true,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      id: 'VirtualizationSeparator-virt-perspective',
      insertAfter: 'virtualization-bootablevolumes-virt-perspective',
      perspective: 'virtualization-perspective',
      testID: 'VirtualizationSeparator',
    },
    type: 'console.navigation/separator',
  } as EncodedExtension<Separator>,
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-bootablevolumes',
        'data-test-id': '-bootablevolumes-nav-item',
      },
      href: 'bootablevolumes',
      id: 'virtualization-bootablevolumes-virt-perspective',
      insertAfter: 'virtualmachines-virt-perspective',
      name: '%plugin__kubevirt-plugin~Bootable volumes%',
      perspective: 'virtualization-perspective',
      prefixNamespaced: true,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-migrationpolicies',
        'data-test-id': 'migrationpolicies-nav-item',
      },
      id: 'migrationpolicies-virt-perspective',
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MigrationPolicy',
        version: 'v1alpha1',
      },
      name: '%plugin__kubevirt-plugin~MigrationPolicies%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-virtualization-checkups',
        'data-test-id': 'virtualization-checkups-nav-item',
      },
      href: 'checkups',
      id: 'virtualization-checkups-virt-perspective',
      insertAfter: 'migrationpolicies-virt-perspective',
      name: '%plugin__kubevirt-plugin~Checkups%',
      perspective: 'virtualization-perspective',
      prefixNamespaced: true,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];

const networkingSection = [
  {
    properties: {
      dataAttributes: { 'data-quickstart-id': 'qs-nav-networking' },
      id: 'networking-virt-perspective',
      insertAfter: 'virtualization-virt-perspective',
      name: '%console-app~Networking%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    properties: {
      id: 'services-virt-perspective',
      model: {
        kind: 'Service',
        version: 'v1',
      },
      name: '%console-app~Services%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    flags: { required: ['OPENSHIFT'] },
    properties: {
      id: 'routes-virt-perspective',
      insertAfter: 'services-virt-perspective',
      model: {
        group: 'route.openshift.io',
        kind: 'Route',
        version: 'v1',
      },
      name: '%console-app~Routes%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    properties: {
      id: 'ingresses-virt-perspective',
      insertAfter: 'routes-virt-perspective',
      model: {
        group: 'networking.k8s.io',
        kind: 'Ingress',
        version: 'v1',
      },
      name: '%console-app~Ingresses%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    properties: {
      id: 'networkpolicies-virt-perspective',
      insertAfter: 'ingresses-virt-perspective',
      model: {
        group: 'networking.k8s.io',
        kind: 'NetworkPolicy',
        version: 'v1',
      },
      name: '%console-app~NetworkPolicies%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    flags: { required: ['MULTI_NETWORK_POLICY_ENABLED'] },
    properties: {
      id: 'multinetworkpolicies-virt-perspective',
      insertAfter: 'networkpolicies-virt-perspective',
      model: {
        group: 'k8s.cni.cncf.io',
        kind: 'MultiNetworkPolicy',
        version: 'v1beta1',
      },
      name: '%console-app~MultiNetworkPolicies%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    flags: {
      required: ['NET_ATTACH_DEF', 'KUBEVIRT_DYNAMIC'],
    },
    properties: {
      id: 'networkattachmentdefinitions',
      model: {
        group: 'k8s.cni.cncf.io',
        kind: 'NetworkAttachmentDefinition',
        version: 'v1',
      },
      name: 'NetworkAttachmentDefinitions',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    flags: {
      required: ['NMSTATE_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-policy-list',
        'data-test-id': 'policy-nav-list',
      },
      id: 'policy-virt-perspective',
      model: {
        group: 'nmstate.io',
        kind: 'NodeNetworkConfigurationPolicy',
        version: 'v1',
      },
      name: '%plugin__nmstate-console-plugin~NodeNetworkConfigurationPolicy%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    flags: {
      required: ['NMSTATE_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-state-list',
        'data-test-id': 'state-nav-list',
      },
      id: 'state',
      model: {
        group: 'nmstate.io',
        kind: 'NodeNetworkState',
        version: 'v1beta1',
      },
      name: '%plugin__nmstate-console-plugin~NodeNetworkState%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
];

const storageSection = [
  {
    properties: {
      dataAttributes: { 'data-quickstart-id': 'qs-nav-storage' },
      id: 'storage-virt-perspective',
      name: '%console-app~Storage%',
      perspective: 'virtualization-perspective',
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
      name: '%console-app~VolumeSnapshotContents%',
      perspective: 'virtualization-perspective',
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
      name: '%console-app~PersistentVolumes%',
      perspective: 'virtualization-perspective',
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
      name: '%console-app~PersistentVolumeClaims%',
      perspective: 'virtualization-perspective',
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
      name: '%console-app~StorageClasses%',
      perspective: 'virtualization-perspective',
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
      perspective: 'virtualization-perspective',
      section: 'storage-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
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
      perspective: 'virtualization-perspective',
      section: 'storage-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
];

const monitoringSection = [
  {
    flags: {
      required: ['PROMETHEUS', 'MONITORING', 'CAN_GET_NS'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-monitoring',
      },
      id: 'observe-virt-perspective',
      insertBefore: ['compute-virt-perspective', 'usermanagement-virt-perspective'],
      name: '%console-app~Observe%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    flags: {
      required: ['PROMETHEUS', 'MONITORING', 'CAN_GET_NS'],
    },
    properties: {
      href: '/monitoring/alerts',
      id: 'alerting-virt-perspective',
      name: '%public~Alerting%',
      perspective: 'virtualization-perspective',
      section: 'observe-virt-perspective',
      startsWith: ['monitoring/alertrules', 'monitoring/silences'],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['PROMETHEUS', 'MONITORING', 'CAN_GET_NS'],
    },
    properties: {
      href: '/monitoring/query-browser',
      id: 'metrics-virt-perspective',
      insertAfter: 'alerts-virt-perspective',
      name: '%public~Metrics%',
      perspective: 'virtualization-perspective',
      section: 'observe-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['PROMETHEUS', 'MONITORING', 'CAN_GET_NS'],
    },
    properties: {
      href: '/monitoring/dashboards',
      id: 'dashboards-virt-perspective',
      insertAfter: 'metrics-virt-perspective',
      name: '%public~Dashboards%',
      perspective: 'virtualization-perspective',
      section: 'observe-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['PROMETHEUS', 'MONITORING', 'CAN_GET_NS'],
    },
    properties: {
      href: '/monitoring/targets',
      id: 'targets-virt-perspective',
      insertAfter: 'dashboards-virt-perspective',
      name: '%public~Targets%',
      perspective: 'virtualization-perspective',
      section: 'observe-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];

const computeSection = [
  {
    flags: { required: ['CAN_LIST_NODE'] },
    properties: {
      dataAttributes: { 'data-quickstart-id': 'qs-nav-compute' },
      id: 'compute-virt-perspective',
      name: '%console-app~Compute%',
      perspective: 'virtualization-perspective',
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
      perspective: 'virtualization-perspective',
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
      perspective: 'virtualization-perspective',
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
      perspective: 'virtualization-perspective',
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
      perspective: 'virtualization-perspective',
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
      name: '%console-app~MachineHealthChecks%',
      perspective: 'virtualization-perspective',
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: { required: ['MACHINE_CONFIG'] },
    properties: {
      id: 'computeseparator-virt-perspective',
      insertAfter: 'machinehealthchecks-virt-perspective',
      perspective: 'virtualization-perspective',
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
      name: '%console-app~MachineConfigs%',
      perspective: 'virtualization-perspective',
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
      name: '%console-app~MachineConfigPools%',
      perspective: 'virtualization-perspective',
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    properties: {
      href: 'hardwaredevices',
      id: 'hardwaredevices-virt-perspective',
      insertBefore: 'baremetalhosts',
      name: '%plugin__kubevirt-plugin~Hardware Devices%',
      perspective: 'virtualization-perspective',
      section: 'compute-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];

export const extensions: EncodedExtension[] = [
  {
    properties: {
      icon: { $codeRef: 'perspective.icon' },
      id: 'virtualization-perspective',
      importRedirectURL: { $codeRef: 'perspective.getImportRedirectURL' },
      landingPageURL: { $codeRef: 'perspective.getLandingPageURL' },
      name: '%plugin__console-virt-perspective-plugin~Virtualization%',
    },
    type: 'console.perspective',
  },
  ...virtualizationSection,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-virtualization',
        'data-test-id': 'virtualization-nav-item',
      },
      id: 'cluster-virt-perspective',
      insertBefore: 'networking',
      name: '%plugin__kubevirt-plugin~Cluster%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/section',
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-cluster-overview',
        'data-test-id': 'cluster-overview-nav-item',
      },
      href: 'dashboards',
      id: 'overview-virt-perspective',
      name: '%plugin__kubevirt-plugin~Overview%',
      perspective: 'virtualization-perspective',
      section: 'cluster-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  ...networkingSection,
  ...storageSection,
  ...monitoringSection,
  ...computeSection,
];
