import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  HrefNavItem,
  NavSection,
  ResourceClusterNavItem,
  ResourceNSNavItem,
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
  } as EncodedExtension<ResourceNSNavItem>,
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
        'data-test-id': 'bootablevolumes-nav-item',
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
  {
    flags: {
      required: ['KUBEVIRT_QUOTAS'],
    },
    properties: {
      dataAttributes: {
        'data-class': 'kv-plugin-virt-perspective-element',
        'data-quickstart-id': 'qs-nav-quotas',
        'data-test-id': 'quotas-nav-item',
      },
      href: 'quotas',
      id: 'quotas-virt-perspective',
      insertAfter: 'virtualization-checkups-virt-perspective',
      name: '%plugin__kubevirt-plugin~Quotas%',
      perspective: 'virtualization-perspective',
      prefixNamespaced: true,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];

const migrationSection = [
  {
    flags: {
      required: ['SHOW_MIGRATION_SECTION'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-migration-virt-perspective',
        'data-testid': 'migration-virt-perspective-nav-item',
      },
      id: 'migration-virt-perspective',
      insertAfter: 'cluster-virt-perspective',
      name: '%plugin__kubevirt-plugin~Migration%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storagemigrations-virt-perspective',
        'data-test-id': 'storagemigrations-virt-perspective-nav-item',
      },
      id: 'storagemigrations-virt-perspective',
      model: {
        group: 'migration.openshift.io',
        kind: 'MigPlan',
        version: 'v1alpha1',
      },
      name: '%plugin__kubevirt-plugin~Storage migrations%',
      perspective: 'virtualization-perspective',
      section: 'migration-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
];

const networkingSection = [
  {
    properties: {
      dataAttributes: { 'data-quickstart-id': 'qs-nav-networking' },
      id: 'networking-virt-perspective',
      insertAfter: 'migration-virt-perspective',
      name: '%plugin__kubevirt-plugin~Networking%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-services',
        'data-test-id': 'services-nav-item',
      },
      id: 'services-virt-perspective',
      model: {
        kind: 'Service',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~Services%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    flags: { required: ['OPENSHIFT'] },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-routes',
        'data-test-id': 'routes-nav-item',
      },
      id: 'routes-virt-perspective',
      insertAfter: 'services-virt-perspective',
      model: {
        group: 'route.openshift.io',
        kind: 'Route',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~Routes%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-ingresses',
        'data-test-id': 'ingresses-nav-item',
      },
      id: 'ingresses-virt-perspective',
      insertAfter: 'routes-virt-perspective',
      model: {
        group: 'networking.k8s.io',
        kind: 'Ingress',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~Ingresses%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-networkpolicies',
        'data-test-id': 'networkpolicies-nav-item',
      },
      id: 'networkpolicies-virt-perspective',
      insertAfter: 'ingresses-virt-perspective',
      model: {
        group: 'networking.k8s.io',
        kind: 'NetworkPolicy',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~NetworkPolicies%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    flags: { required: ['MULTI_NETWORK_POLICY_ENABLED'] },
    properties: {
      dataAttributes: {
        'data-border': 'no-border',
        'data-quickstart-id': 'qs-nav-multinetworkpolicies',
        'data-test-id': 'multinetworkpolicies-nav-item',
      },
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
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-nads',
        'data-test-id': 'nads-nav-item',
      },
      id: 'networkattachmentdefinitions-virt-perspective',
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
      required: ['FLAG_UDN_ENABLED'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-udns',
        'data-test-id': 'udns-nav-item',
      },
      id: 'udns-virt-perspective',
      model: {
        group: 'k8s.ovn.org',
        kind: 'UserDefinedNetwork',
        version: 'v1',
      },
      name: '%plugin__networking-console-plugin~UserDefinedNetworks%',
      perspective: 'virtualization-perspective',
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
];

const storageSection = [
  {
    properties: {
      dataAttributes: { 'data-quickstart-id': 'qs-nav-storage' },
      id: 'storage-virt-perspective',
      name: '%plugin__kubevirt-plugin~Storage%',
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
      name: '%plugin__kubevirt-plugin~VolumeSnapshotContents%',
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
      name: '%plugin__kubevirt-plugin~PersistentVolumes%',
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
      name: '%plugin__kubevirt-plugin~PersistentVolumeClaims%',
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
      name: '%plugin__kubevirt-plugin~StorageClasses%',
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
      name: '%plugin__kubevirt-plugin~MachineHealthChecks%',
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
      name: '%plugin__kubevirt-plugin~MachineConfigs%',
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
      name: '%plugin__kubevirt-plugin~MachineConfigPools%',
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
    flags: {
      disallowed: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      icon: { $codeRef: 'perspective.icon' },
      id: 'virtualization-perspective',
      importRedirectURL: { $codeRef: 'perspective.getImportRedirectURL' },
      landingPageURL: { $codeRef: 'perspective.getVirtualizationLandingPageURL' },
      name: '%plugin__kubevirt-plugin~Virtualization%',
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
  ...migrationSection,
  ...networkingSection,
  ...storageSection,
  ...computeSection,
];
