import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { ApplicationAwareResourceQuotaModel } from '@kubevirt-utils/models';

export const initialQuotaYaml = {
  apiVersion: `${ApplicationAwareResourceQuotaModel.apiGroup}/${ApplicationAwareResourceQuotaModel.apiVersion}`,
  kind: ApplicationAwareResourceQuotaModel.kind,
  metadata: {
    name: '',
  },
};

export const QUOTA_UNITS = {
  cpu: 'vCPU',
  memory: CAPACITY_UNITS.GiB,
  vmCount: 'VMs',
} as const;
