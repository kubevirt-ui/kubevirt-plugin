import { type TFunction } from 'i18next';

import { OLSPromptType } from '@lightspeed/utils/prompts';
import { DESCHEDULER_OPERATOR_NAME } from '@kubevirt-utils/resources/descheduler/constants';
import {
  CLUSTER_OBSERVABILITY_OPERATOR_NAME,
  FENCE_AGENTS_OPERATOR_NAME,
  NETOBSERV_OPERATOR_NAME,
  NMSTATE_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';

import {
  CLUSTER_LOGGING_OPERATOR_NAME,
  LOCAL_STORAGE_OPERATOR_NAME,
  LOKI_OPERATOR_NAME,
  METALLB_OPERATOR_NAME,
  MTV_OPERATOR_NAME,
  MULTICLUSTER_ENGINE_OPERATOR_NAME,
  NODE_FEATURE_DISCOVERY_OPERATOR_NAME,
  NODE_MAINTENANCE_OPERATOR_NAME,
  NUMA_RESOURCES_OPERATOR_NAME,
  OADP_OPERATOR_NAME,
  SANDBOXED_CONTAINERS_OPERATOR_NAME,
} from './operatorNames';
import { type CapabilityFeature } from './types';

export const getRecommendedCapabilityFeatures = (t: TFunction): CapabilityFeature[] => [
  {
    description: t(
      'Backup and restore cluster resources and persistent volumes against accidental loss or system failures.',
    ),
    id: 'backup-and-recovery',
    isDefaultBundle: false,
    operators: [{ packageName: OADP_OPERATOR_NAME }],
    title: t('Backup and recovery'),
  },
  {
    description: t(
      'Leverage specific node hardware features for smarter workload scheduling. (Developer Preview in Assisted Installer).',
    ),
    id: 'hardware-aware-scheduling',
    isDefaultBundle: true,
    operators: [{ packageName: NODE_FEATURE_DISCOVERY_OPERATOR_NAME }],
    title: t('Hardware-aware scheduling'),
  },
  {
    description: t(
      'Keeps workloads available when nodes fail using health checks, fencing, and maintenance mode.',
    ),
    id: 'high-availability',
    isDefaultBundle: true,
    operators: [
      {
        alternativesPromptType: OLSPromptType.NODE_HEALTH_CHECK_OPERATOR_ALTERNATIVES,
        packageName: NODE_HEALTH_OPERATOR_NAME,
      },
      {
        alternativesPromptType: OLSPromptType.FENCE_AGENTS_REMEDIATION_OPERATOR_ALTERNATIVES,
        packageName: FENCE_AGENTS_OPERATOR_NAME,
      },
      { packageName: NODE_MAINTENANCE_OPERATOR_NAME },
    ],
    title: t('High availability'),
  },
  {
    description: t(
      'Configure and maintain consistent host networking configuration across cluster nodes using NMState.',
    ),
    id: 'host-network-management',
    isDefaultBundle: true,
    operators: [{ packageName: NMSTATE_OPERATOR_NAME }],
    title: t('Host network management'),
  },
  {
    description: t('Run workloads in lightweight VMs using Kata Containers for enhanced security.'),
    id: 'isolated-workloads',
    isDefaultBundle: true,
    operators: [{ packageName: SANDBOXED_CONTAINERS_OPERATOR_NAME }],
    title: t('Isolated workloads (Kata)'),
  },
  {
    description: t(
      'Optimize VM placement and provide load balancer services for bare-metal clusters.',
    ),
    id: 'load-balancing',
    isDefaultBundle: true,
    operators: [
      {
        alternativesPromptType: OLSPromptType.KUBE_DESCHEDULER_OPERATOR_ALTERNATIVES,
        packageName: DESCHEDULER_OPERATOR_NAME,
      },
      { packageName: METALLB_OPERATOR_NAME },
    ],
    title: t('Load balancing'),
  },
  {
    description: t(
      'Create, import, and manage multiple OpenShift clusters from a single, centralized hub cluster.',
    ),
    id: 'manage-clusters-from-hub',
    isDefaultBundle: true,
    operators: [{ packageName: MULTICLUSTER_ENGINE_OPERATOR_NAME }],
    title: t('Manage clusters from a hub'),
  },
  {
    description: t('Migrate VMs from VMware, Red Hat Virtualization, or OpenStack.'),
    id: 'migrate-vms',
    isDefaultBundle: true,
    operators: [{ packageName: MTV_OPERATOR_NAME }],
    title: t('Migrate VMs'),
  },
  {
    description: t(
      'Deploy high-performance workloads with optimal efficiency using NUMA-aware scheduling.',
    ),
    id: 'numa-aware-scheduling',
    isDefaultBundle: true,
    operators: [{ packageName: NUMA_RESOURCES_OPERATOR_NAME }],
    title: t('NUMA-aware scheduling'),
  },
  {
    description: t(
      'Provision persistent storage using local volumes directly on your cluster nodes.',
    ),
    id: 'storage-on-local-disks',
    isDefaultBundle: true,
    operators: [{ packageName: LOCAL_STORAGE_OPERATOR_NAME }],
    title: t('Storage on local disks'),
  },
  {
    description: t(
      'Monitor workload health and performance using metrics, logging, network flows, and virtualization dashboards.',
    ),
    id: 'virtualization-dashboards',
    isDefaultBundle: true,
    operators: [
      { packageName: CLUSTER_OBSERVABILITY_OPERATOR_NAME },
      { packageName: LOKI_OPERATOR_NAME },
      { packageName: CLUSTER_LOGGING_OPERATOR_NAME },
      { packageName: NETOBSERV_OPERATOR_NAME },
    ],
    title: t('Virtualization dashboards'),
  },
];
