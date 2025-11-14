import {
  ApplicationAwareClusterResourceQuotaModel,
  ApplicationAwareResourceQuotaModel,
} from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { getHardFieldKeys } from '../../utils/utils';
import {
  ApplicationAwareClusterResourceQuota,
  ApplicationAwareQuota,
  ApplicationAwareResourceQuota,
  ResourceInfo,
  VirtualizationQuota,
} from '../types';

const getLimitsYAML = (quota: VirtualizationQuota, isDedicatedVirtualResources: boolean) => {
  const { cpu, memory, vmCount } = getHardFieldKeys(isDedicatedVirtualResources);

  const config: ResourceInfo = {
    [cpu]: quota.cpuLimit?.toString(),
    [memory]: quota.memoryLimit ? `${quota.memoryLimit}Gi` : undefined,
    [vmCount]: quota.vmCountLimit?.toString(),
  };

  return config;
};

const createClusterResourceQuotaYAML = (
  quota: VirtualizationQuota,
  hard: ResourceInfo,
): ApplicationAwareClusterResourceQuota => {
  const matchLabels = isEmpty(quota.labelSelectors)
    ? undefined
    : quota.labelSelectors.reduce((acc, label) => {
        acc[label.key] = label.value;
        return acc;
      }, {} as Record<string, string>);

  const matchExpressions = isEmpty(quota.projects)
    ? undefined
    : [
        {
          key: 'kubernetes.io/metadata.name',
          operator: Operator.In,
          values: quota.projects,
        },
      ];

  return {
    apiVersion: `${ApplicationAwareClusterResourceQuotaModel.apiGroup}/${ApplicationAwareClusterResourceQuotaModel.apiVersion}`,
    kind: ApplicationAwareClusterResourceQuotaModel.kind,
    metadata: {
      name: quota.name,
    },
    spec: {
      quota: {
        hard,
      },
      selector: {
        labels: {
          matchExpressions,
          matchLabels,
        },
      },
    },
  };
};

const createResourceQuotaYAML = (
  quota: VirtualizationQuota,
  hard: ResourceInfo,
): ApplicationAwareResourceQuota => {
  return {
    apiVersion: `${ApplicationAwareResourceQuotaModel.apiGroup}/${ApplicationAwareResourceQuotaModel.apiVersion}`,
    kind: ApplicationAwareResourceQuotaModel.kind,
    metadata: {
      name: quota.name,
      namespace: quota.namespace,
    },
    spec: {
      hard,
    },
  };
};

export const toYaml = (
  quota: VirtualizationQuota,
  isDedicatedVirtualResources: boolean,
): ApplicationAwareQuota => {
  const hard = getLimitsYAML(quota, isDedicatedVirtualResources);

  return quota.scope === 'cluster'
    ? createClusterResourceQuotaYAML(quota, hard)
    : createResourceQuotaYAML(quota, hard);
};
