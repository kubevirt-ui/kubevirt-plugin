import { type TFunction } from 'i18next';

import { DESCHEDULER_OPERATOR_NAME } from '@kubevirt-utils/resources/descheduler/constants';
import { OLSPromptType } from '@lightspeed/utils/prompts';
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
import { type CapabilityFeatureOperator } from './types';

export const getOperatorDefinitions = (
  t: TFunction,
): Record<string, CapabilityFeatureOperator> => ({
  [CLUSTER_LOGGING_OPERATOR_NAME]: {
    description: t(
      'Collect, store, and forward cluster and application logs to simplify troubleshooting and compliance.',
    ),
    displayName: t('OpenShift Logging'),
    packageName: CLUSTER_LOGGING_OPERATOR_NAME,
  },
  [CLUSTER_OBSERVABILITY_OPERATOR_NAME]: {
    description: t('Track real-time, in-depth metrics using dedicated performance dashboards.'),
    displayName: t('Cluster observability'),
    packageName: CLUSTER_OBSERVABILITY_OPERATOR_NAME,
  },
  [DESCHEDULER_OPERATOR_NAME]: {
    alternativesPromptType: OLSPromptType.KUBE_DESCHEDULER_OPERATOR_ALTERNATIVES,
    description: t(
      'Balance workload distribution automatically based on CPU utilization and node CPU pressure.',
    ),
    displayName: t('Descheduler'),
    packageName: DESCHEDULER_OPERATOR_NAME,
  },
  [FENCE_AGENTS_OPERATOR_NAME]: {
    alternativesPromptType: OLSPromptType.FENCE_AGENTS_REMEDIATION_OPERATOR_ALTERNATIVES,
    description: t(
      'The Fence Agents Remediation Operator uses well-known agents to fence and remediate unhealthy nodes.',
    ),
    displayName: t('Fence agents remediation'),
    packageName: FENCE_AGENTS_OPERATOR_NAME,
  },
  [LOCAL_STORAGE_OPERATOR_NAME]: {
    description: t('Provision persistent volumes from local disks on your cluster nodes.'),
    displayName: t('Local storage'),
    packageName: LOCAL_STORAGE_OPERATOR_NAME,
  },
  [LOKI_OPERATOR_NAME]: {
    description: t(
      'Store and manage cluster and virtualization logs using a horizontally scalable, highly available, multi-tenant log aggregation backend.',
    ),
    displayName: t('Loki'),
    packageName: LOKI_OPERATOR_NAME,
  },
  [METALLB_OPERATOR_NAME]: {
    description: t('Expose services on bare-metal clusters with load balancer IP addresses.'),
    displayName: t('MetalLB'),
    packageName: METALLB_OPERATOR_NAME,
  },
  [MTV_OPERATOR_NAME]: {
    description: t('Migrate VMs from VMware, Red Hat Virtualization, or OpenShift Virtualization.'),
    displayName: t('Migration Toolkit for Virtualization'),
    packageName: MTV_OPERATOR_NAME,
  },
  [MULTICLUSTER_ENGINE_OPERATOR_NAME]: {
    description: t('Create, import, and manage OpenShift clusters from a central hub cluster.'),
    displayName: t('Multicluster engine'),
    packageName: MULTICLUSTER_ENGINE_OPERATOR_NAME,
  },
  [NETOBSERV_OPERATOR_NAME]: {
    description: t('Monitor network flows and communication paths across a cluster.'),
    displayName: t('Network observability'),
    packageName: NETOBSERV_OPERATOR_NAME,
  },
  [NMSTATE_OPERATOR_NAME]: {
    description: t(
      'Manage the underlying host network configuration for all nodes in your cluster using standard Kubernetes APIs.',
    ),
    displayName: t('Host network management (NMState)'),
    packageName: NMSTATE_OPERATOR_NAME,
  },
  [NODE_FEATURE_DISCOVERY_OPERATOR_NAME]: {
    description: t(
      'Identify and label specific hardware capabilities across your nodes to ensure workloads are scheduled on the right hosts.',
    ),
    displayName: t('Node Feature Discovery (NFD)'),
    packageName: NODE_FEATURE_DISCOVERY_OPERATOR_NAME,
  },
  [NODE_HEALTH_OPERATOR_NAME]: {
    alternativesPromptType: OLSPromptType.NODE_HEALTH_CHECK_OPERATOR_ALTERNATIVES,
    description: t('Detect failed nodes automatically and trigger remediation.'),
    displayName: t('Node health check'),
    packageName: NODE_HEALTH_OPERATOR_NAME,
  },
  [NODE_MAINTENANCE_OPERATOR_NAME]: {
    description: t('Safely drains workloads from a node before planned maintenance or reboot.'),
    displayName: t('Node maintenance'),
    packageName: NODE_MAINTENANCE_OPERATOR_NAME,
  },
  [NUMA_RESOURCES_OPERATOR_NAME]: {
    description: t(
      'Configure NUMA-aware scheduling to improve performance for virtualization workloads.',
    ),
    displayName: t('NUMA resources'),
    packageName: NUMA_RESOURCES_OPERATOR_NAME,
  },
  [OADP_OPERATOR_NAME]: {
    description: t(
      'Protect cluster resources and persistent data volumes with backup and restore capabilities.',
    ),
    displayName: t('OADP'),
    packageName: OADP_OPERATOR_NAME,
  },
  [SANDBOXED_CONTAINERS_OPERATOR_NAME]: {
    description: t(
      'Run selected workloads in lightweight VMs using Kata Containers for enhanced security.',
    ),
    displayName: t('Sandboxed containers'),
    packageName: SANDBOXED_CONTAINERS_OPERATOR_NAME,
  },
});
