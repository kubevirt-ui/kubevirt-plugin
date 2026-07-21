import { type TFunction } from 'i18next';

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
import { getOperatorDefinitions } from './operatorDefinitions';
import { type CapabilityFeature } from './types';

export const getRecommendedCapabilityFeatures = (t: TFunction): CapabilityFeature[] => {
  const ops = getOperatorDefinitions(t);

  return [
    {
      description: t(
        'Safeguard critical cluster resources and persistent data volumes against accidental loss or system failures.',
      ),
      id: 'backup-and-recovery',
      isDefaultBundle: false,
      operators: [ops[OADP_OPERATOR_NAME]],
      title: t('Backup and recovery'),
    },
    {
      description: t(
        'Leverage specific node hardware features for smarter workload scheduling. (Developer Preview in Assisted Installer).',
      ),
      id: 'hardware-aware-scheduling',
      isDefaultBundle: true,
      operators: [ops[NODE_FEATURE_DISCOVERY_OPERATOR_NAME]],
      title: t('Hardware-aware scheduling'),
    },
    {
      description: t(
        'Keeps workloads available when nodes fail using health checks, fencing, and maintenance mode.',
      ),
      id: 'high-availability',
      isDefaultBundle: true,
      operators: [
        ops[NODE_HEALTH_OPERATOR_NAME],
        ops[FENCE_AGENTS_OPERATOR_NAME],
        ops[NODE_MAINTENANCE_OPERATOR_NAME],
      ],
      title: t('High availability'),
    },
    {
      description: t(
        'Configure and maintain consistent host networking configuration across cluster nodes using NMState.',
      ),
      id: 'host-network-management',
      isDefaultBundle: true,
      operators: [ops[NMSTATE_OPERATOR_NAME]],
      title: t('Host network management'),
    },
    {
      description: t(
        'Run workloads in lightweight VMs using Kata Containers for enhanced security.',
      ),
      id: 'isolated-workloads',
      isDefaultBundle: true,
      operators: [ops[SANDBOXED_CONTAINERS_OPERATOR_NAME]],
      title: t('Isolated workloads (Kata)'),
    },
    {
      description: t(
        'Optimize VM placement and provide load balancer services for bare-metal clusters.',
      ),
      id: 'load-balancing',
      isDefaultBundle: true,
      operators: [ops[DESCHEDULER_OPERATOR_NAME], ops[METALLB_OPERATOR_NAME]],
      title: t('Load balancing'),
    },
    {
      description: t(
        'Create, import, and manage multiple OpenShift clusters from a single, centralized hub cluster.',
      ),
      id: 'manage-clusters-from-hub',
      isDefaultBundle: true,
      operators: [ops[MULTICLUSTER_ENGINE_OPERATOR_NAME]],
      title: t('Manage clusters from a hub'),
    },
    {
      description: t('Migrate VMs from VMware, Red Hat Virtualization, or OpenStack.'),
      id: 'migrate-vms',
      isDefaultBundle: true,
      operators: [ops[MTV_OPERATOR_NAME]],
      title: t('Migrate VMs'),
    },
    {
      description: t(
        'Deploy high-performance workloads with optimal efficiency using NUMA-aware scheduling.',
      ),
      id: 'numa-aware-scheduling',
      isDefaultBundle: true,
      operators: [ops[NUMA_RESOURCES_OPERATOR_NAME]],
      title: t('NUMA-aware scheduling'),
    },
    {
      description: t(
        'Provision persistent storage using local volumes directly on your cluster nodes.',
      ),
      id: 'storage-on-local-disks',
      isDefaultBundle: true,
      operators: [ops[LOCAL_STORAGE_OPERATOR_NAME]],
      title: t('Storage on local disks'),
    },
    {
      description: t(
        'Monitor workload health and performance using metrics, logging, network flows, and virtualization dashboards.',
      ),
      id: 'virtualization-dashboards',
      isDefaultBundle: true,
      operators: [
        ops[CLUSTER_OBSERVABILITY_OPERATOR_NAME],
        ops[LOKI_OPERATOR_NAME],
        ops[CLUSTER_LOGGING_OPERATOR_NAME],
        ops[NETOBSERV_OPERATOR_NAME],
      ],
      title: t('Virtualization dashboards'),
    },
  ];
};
