import { ReactNode, useMemo } from 'react';
import { TFunction } from 'react-i18next';
import { RESOURCE_KEYS } from 'src/views/quotas/utils/constants';

import {
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
} from '@kubevirt-utils/models';
import { ApplicationAwareResourceQuota } from '@kubevirt-utils/resources/quotas/types';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export type MetricQuotaData = {
  icon?: ReactNode;
  label: string;
  quotaValue: number;
  requestedValue: number;
};

type ProjectResourceQuota = {
  cpu?: MetricQuotaData;
  memory?: MetricQuotaData;
  storage?: MetricQuotaData;
  vms?: MetricQuotaData;
};

export const UNIT_GIB = 'GiB';
export const UNIT_VCPU = 'vCPU';
export const UNIT_VMS = 'VMs';

export const getUnitLabel = (unit: string, t: TFunction): string => {
  switch (unit) {
    case UNIT_GIB:
      return t('GiB');
    case UNIT_VCPU:
      return t('vCPU');
    case UNIT_VMS:
      return t('VMs');
    default:
      return unit;
  }
};

const parseQuantity = (value: string | undefined): number =>
  value != null ? (convertToBaseValue(value) as number) ?? 0 : 0;

const toGiB = (bytes: number): number => humanizeBinaryBytes(bytes, null, UNIT_GIB)?.value ?? 0;

type QuotaStatusMaps = {
  hard: Record<string, string | undefined>;
  used: Record<string, string | undefined>;
};

const aggregateQuotaStatus = (quotas: ApplicationAwareResourceQuota[]): QuotaStatusMaps => {
  const hard: Record<string, string | undefined> = {};
  const used: Record<string, string | undefined> = {};

  for (const q of quotas) {
    const status = q.status;
    if (status?.hard) {
      for (const [key, value] of Object.entries(status.hard) as [string, string][]) {
        if (!(key in hard) && value) hard[key] = value;
      }
    }
    if (status?.used) {
      for (const [key, value] of Object.entries(status.used) as [string, string][]) {
        if (!(key in used) && value) used[key] = value;
      }
    }
  }

  return { hard, used };
};

type UseProjectResourceQuotaResult = {
  loaded: boolean;
  loadError: unknown;
  projectQuota: ProjectResourceQuota | undefined;
};

const useProjectResourceQuota = (namespace?: string): UseProjectResourceQuotaResult => {
  const [quotas, loaded, loadError] = useK8sWatchResource<ApplicationAwareResourceQuota[]>(
    namespace
      ? {
          groupVersionKind: modelToGroupVersionKind(ApplicationAwareResourceQuotaModel),
          isList: true,
          namespace,
          optional: true,
        }
      : null,
  );

  const projectQuota = useMemo<ProjectResourceQuota | undefined>(() => {
    if (!namespace || !loaded || loadError || !quotas?.length) return undefined;

    const { hard, used } = aggregateQuotaStatus(quotas);

    const cpuHard = parseQuantity(hard[RESOURCE_KEYS.cpuRequests]);
    const cpuUsed = parseQuantity(used[RESOURCE_KEYS.cpuRequests]);

    const memHardBytes = parseQuantity(hard[RESOURCE_KEYS.memoryRequests]);
    const memUsedBytes = parseQuantity(used[RESOURCE_KEYS.memoryRequests]);

    const storHardBytes = parseQuantity(hard[RESOURCE_KEYS.storageRequests]);
    const storUsedBytes = parseQuantity(used[RESOURCE_KEYS.storageRequests]);

    const vmHard = Number(hard[RESOURCE_KEYS.vmiCount] ?? 0);
    const vmUsed = Number(used[RESOURCE_KEYS.vmiCount] ?? 0);

    const result: ProjectResourceQuota = {};

    if (cpuHard > 0) {
      result.cpu = {
        label: UNIT_VCPU,
        quotaValue: cpuHard,
        requestedValue: cpuUsed,
      };
    }

    const memHardGiB = toGiB(memHardBytes);
    if (memHardGiB > 0) {
      const memUsedGiB = toGiB(memUsedBytes);
      result.memory = {
        label: UNIT_GIB,
        quotaValue: memHardGiB,
        requestedValue: memUsedGiB,
      };
    }

    const storHardGiB = toGiB(storHardBytes);
    if (storHardGiB > 0) {
      const storUsedGiB = toGiB(storUsedBytes);
      result.storage = {
        label: UNIT_GIB,
        quotaValue: storHardGiB,
        requestedValue: storUsedGiB,
      };
    }

    if (vmHard > 0) {
      result.vms = {
        label: UNIT_VMS,
        quotaValue: vmHard,
        requestedValue: vmUsed,
      };
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }, [quotas, loaded, loadError, namespace]);

  return { loaded, loadError: loadError ?? null, projectQuota };
};

export default useProjectResourceQuota;
