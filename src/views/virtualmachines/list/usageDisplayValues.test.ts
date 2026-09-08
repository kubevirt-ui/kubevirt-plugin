import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { type PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

import { Metric, resetVMMetrics, setMetricFromResponse } from './metrics';
import {
  getCPUUsageDisplayValue,
  getMemoryUsageDisplayValue,
  getNetworkUsageDisplayValue,
} from './usageDisplayValues';

const ONE_MIB_IN_BYTES = 1048576;
const TWO_GIB_IN_BYTES = 2147483648;

const createVM = (name: string, printableStatus = 'Running'): V1VirtualMachine =>
  ({
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: { name, namespace: 'usage-ns' },
    status: { printableStatus },
  }) as V1VirtualMachine;

const setMetric = (name: string, metric: Metric, value: number): void => {
  const response: PrometheusResponse = {
    data: {
      result: [
        {
          metric: { name, namespace: 'usage-ns' },
          value: [Date.now() / 1000, String(value)],
        },
      ],
      resultType: 'vector',
    },
    status: 'success',
  };

  setMetricFromResponse(response, metric);
};

describe('usageDisplayValues', () => {
  beforeEach(() => {
    resetVMMetrics();
  });

  describe('getCPUUsageDisplayValue', () => {
    it('returns a percentage for a running VM with CPU metrics', () => {
      setMetric('cpu-display-vm', Metric.CpuUsage, 1);
      const vm = createVM('cpu-display-vm');

      expect(getCPUUsageDisplayValue(vm, { cores: 2 })).toBe('50.00%');
    });

    it('returns a dash when the VM is not running', () => {
      setMetric('cpu-stopped-vm', Metric.CpuUsage, 1);
      const vm = createVM('cpu-stopped-vm', 'Stopped');

      expect(getCPUUsageDisplayValue(vm, { cores: 2 })).toBe(NO_DATA_DASH);
    });

    it('returns a dash when CPU metrics are missing', () => {
      expect(getCPUUsageDisplayValue(createVM('cpu-empty-vm'), { cores: 2 })).toBe(NO_DATA_DASH);
    });

    it('returns 0.00% when CPU usage is zero', () => {
      setMetric('cpu-idle-vm', Metric.CpuUsage, 0);
      expect(getCPUUsageDisplayValue(createVM('cpu-idle-vm'), { cores: 2 })).toBe('0.00%');
    });

    it('returns a dash when the VMI CPU is missing', () => {
      setMetric('cpu-no-vmi-vm', Metric.CpuUsage, 1);
      expect(getCPUUsageDisplayValue(createVM('cpu-no-vmi-vm'), undefined)).toBe(NO_DATA_DASH);
    });
  });

  describe('getMemoryUsageDisplayValue', () => {
    it('returns a percentage for a running VM with memory metrics', () => {
      setMetric('mem-display-vm', Metric.MemoryUsage, TWO_GIB_IN_BYTES);
      const vm = createVM('mem-display-vm');

      expect(getMemoryUsageDisplayValue(vm, '4Gi')).toBe('50.00%');
    });

    it('returns a dash when the VM is not running', () => {
      setMetric('mem-stopped-vm', Metric.MemoryUsage, TWO_GIB_IN_BYTES);
      const vm = createVM('mem-stopped-vm', 'Stopped');

      expect(getMemoryUsageDisplayValue(vm, '4Gi')).toBe(NO_DATA_DASH);
    });

    it('returns a dash when memory metrics are missing', () => {
      expect(getMemoryUsageDisplayValue(createVM('mem-empty-vm'), '4Gi')).toBe(NO_DATA_DASH);
    });

    it('returns 0.00% when memory usage is zero', () => {
      setMetric('mem-idle-vm', Metric.MemoryUsage, 0);
      expect(getMemoryUsageDisplayValue(createVM('mem-idle-vm'), '4Gi')).toBe('0.00%');
    });
  });

  describe('getNetworkUsageDisplayValue', () => {
    it('returns a formatted rate for a running VM with network metrics', () => {
      setMetric('net-display-vm', Metric.NetworkUsage, ONE_MIB_IN_BYTES);
      const vm = createVM('net-display-vm');

      expect(getNetworkUsageDisplayValue(vm)).toBe('1 MiBps');
    });

    it('returns a dash when the VM is not running', () => {
      setMetric('net-stopped-vm', Metric.NetworkUsage, ONE_MIB_IN_BYTES);
      const vm = createVM('net-stopped-vm', 'Stopped');

      expect(getNetworkUsageDisplayValue(vm)).toBe(NO_DATA_DASH);
    });

    it('returns a dash when network metrics are missing', () => {
      expect(getNetworkUsageDisplayValue(createVM('net-empty-vm'))).toBe(NO_DATA_DASH);
    });

    it('returns a zero rate when network usage is zero', () => {
      setMetric('net-idle-vm', Metric.NetworkUsage, 0);
      expect(getNetworkUsageDisplayValue(createVM('net-idle-vm'))).toBe('0 Bps');
    });
  });
});
