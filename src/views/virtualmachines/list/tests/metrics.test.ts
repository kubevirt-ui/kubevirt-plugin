import { V1CPU, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

import {
  getCPUUsagePercentage,
  getMemoryUsagePercentage,
  getNetworkUsagePercentage,
  getVMMetricsWithParams,
  Metric,
  setMetricFromResponse,
} from '../metrics';

// VM Constants
const VM_API_VERSION = 'kubevirt.io/v1';
const VM_KIND = 'VirtualMachine';
const DEFAULT_VM_NAME = 'test-vm';
const DEFAULT_NAMESPACE = 'test-namespace';

// Cluster Constants
const MANAGED_CLUSTER_NAME = 'managed-cluster';

// Prometheus Response Constants
const PROMETHEUS_RESULT_TYPE_VECTOR = 'vector';
const PROMETHEUS_STATUS_SUCCESS = 'success';

// Memory Constants (in bytes)
const ONE_GIB_IN_BYTES = 1073741824;
const TWO_GIB_IN_BYTES = 2147483648;
const ONE_MIB_IN_BYTES = 1048576;

jest.mock('@kubevirt-utils/resources/shared', () => ({
  getName: (obj: { metadata?: { name?: string } }) => obj?.metadata?.name,
  getNamespace: (obj: { metadata?: { namespace?: string } }) => obj?.metadata?.namespace,
}));

jest.mock('@kubevirt-utils/resources/vm', () => ({
  getVCPUCount: (cpu: V1CPU) => {
    if (!cpu) return 0;
    return (cpu.sockets || 1) * (cpu.cores || 1) * (cpu.threads || 1);
  },
}));

jest.mock('@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils', () => ({
  getMemorySize: (memory: string) => {
    if (!memory) return null;
    const match = memory.match(/^(\d+)(\w+)$/);
    return match ? { size: parseInt(match[1], 10), unit: match[2].replace('B', '') } : null;
  },
}));

jest.mock('@multicluster/helpers/selectors', () => ({
  getCluster: (obj: { cluster?: string }) => obj?.cluster,
}));

const createMockVM = (overrides: {
  cluster?: string;
  name?: string;
  namespace?: string;
}): V1VirtualMachine =>
  ({
    apiVersion: VM_API_VERSION,
    cluster: overrides.cluster,
    kind: VM_KIND,
    metadata: {
      name: overrides.name ?? DEFAULT_VM_NAME,
      namespace: overrides.namespace ?? DEFAULT_NAMESPACE,
    },
  } as V1VirtualMachine);

const createMockPrometheusResponse = (
  results: Array<{ cluster?: string; name: string; namespace: string; value: number }>,
): PrometheusResponse => ({
  data: {
    result: results.map((r) => ({
      metric: { cluster: r.cluster, name: r.name, namespace: r.namespace },
      value: [Date.now() / 1000, String(r.value)],
    })),
    resultType: PROMETHEUS_RESULT_TYPE_VECTOR,
  },
  status: PROMETHEUS_STATUS_SUCCESS,
});

describe('VM Metrics', () => {
  describe('setMetricFromResponse', () => {
    it('should store metrics from Prometheus response for hub and managed clusters', () => {
      const response = createMockPrometheusResponse([
        { name: 'vm-1', namespace: 'ns-1', value: 0.5 },
        { cluster: MANAGED_CLUSTER_NAME, name: 'vm-managed', namespace: 'ns-managed', value: 1.5 },
      ]);

      setMetricFromResponse(response, Metric.cpuUsage);

      expect(getVMMetricsWithParams('vm-1', 'ns-1').cpuUsage).toBe(0.5);
      expect(
        getVMMetricsWithParams('vm-managed', 'ns-managed', MANAGED_CLUSTER_NAME).cpuUsage,
      ).toBe(1.5);
    });

    it('should handle empty/invalid Prometheus responses gracefully', () => {
      expect(() =>
        setMetricFromResponse(
          {
            data: { result: [], resultType: PROMETHEUS_RESULT_TYPE_VECTOR },
            status: PROMETHEUS_STATUS_SUCCESS,
          },
          Metric.networkUsage,
        ),
      ).not.toThrow();
      expect(() =>
        setMetricFromResponse(undefined as unknown as PrometheusResponse, Metric.cpuUsage),
      ).not.toThrow();
    });

    it('should store different metric types for the same VM', () => {
      setMetricFromResponse(
        createMockPrometheusResponse([{ name: 'multi-vm', namespace: 'ns', value: 2.5 }]),
        Metric.cpuUsage,
      );
      setMetricFromResponse(
        createMockPrometheusResponse([
          { name: 'multi-vm', namespace: 'ns', value: ONE_GIB_IN_BYTES },
        ]),
        Metric.memoryUsage,
      );

      const metrics = getVMMetricsWithParams('multi-vm', 'ns');
      expect(metrics.cpuUsage).toBe(2.5);
      expect(metrics.memoryUsage).toBe(ONE_GIB_IN_BYTES);
    });

    it('should handle Prometheus response with missing name or namespace fields', () => {
      // Response with missing name field
      const responseWithMissingName: PrometheusResponse = {
        data: {
          result: [
            {
              metric: { namespace: 'ns-only' } as {
                cluster?: string;
                name: string;
                namespace: string;
              },
              value: [Date.now() / 1000, '1.0'],
            },
          ],
          resultType: PROMETHEUS_RESULT_TYPE_VECTOR,
        },
        status: PROMETHEUS_STATUS_SUCCESS,
      };

      // Response with missing namespace field
      const responseWithMissingNamespace: PrometheusResponse = {
        data: {
          result: [
            {
              metric: { name: 'name-only' } as {
                cluster?: string;
                name: string;
                namespace: string;
              },
              value: [Date.now() / 1000, '2.0'],
            },
          ],
          resultType: PROMETHEUS_RESULT_TYPE_VECTOR,
        },
        status: PROMETHEUS_STATUS_SUCCESS,
      };

      // Should not throw when processing responses with missing fields
      expect(() => setMetricFromResponse(responseWithMissingName, Metric.cpuUsage)).not.toThrow();
      expect(() =>
        setMetricFromResponse(responseWithMissingNamespace, Metric.cpuUsage),
      ).not.toThrow();
    });
  });

  describe('multicluster metrics isolation', () => {
    it('should keep metrics isolated between hub and managed clusters with same VM names', () => {
      setMetricFromResponse(
        createMockPrometheusResponse([{ name: 'dup-vm', namespace: 'dup-ns', value: 1.0 }]),
        Metric.cpuUsage,
      );
      setMetricFromResponse(
        createMockPrometheusResponse([
          { cluster: MANAGED_CLUSTER_NAME, name: 'dup-vm', namespace: 'dup-ns', value: 2.0 },
        ]),
        Metric.cpuUsage,
      );

      const hubVM = createMockVM({ name: 'dup-vm', namespace: 'dup-ns' });
      const managedVM = createMockVM({
        cluster: MANAGED_CLUSTER_NAME,
        name: 'dup-vm',
        namespace: 'dup-ns',
      });
      const vmiCPU: V1CPU = { cores: 2 };

      expect(getCPUUsagePercentage(hubVM, vmiCPU)).toBe(50); // 1.0/2 * 100
      expect(getCPUUsagePercentage(managedVM, vmiCPU)).toBe(100); // 2.0/2 * 100
    });
  });

  describe('getCPUUsagePercentage', () => {
    it('should calculate CPU usage percentage correctly', () => {
      setMetricFromResponse(
        createMockPrometheusResponse([{ name: 'cpu-vm', namespace: 'cpu-ns', value: 2 }]),
        Metric.cpuUsage,
      );

      const vm = createMockVM({ name: 'cpu-vm', namespace: 'cpu-ns' });
      expect(getCPUUsagePercentage(vm, { cores: 4 })).toBe(50);
    });

    it('should return undefined when no CPU data exists', () => {
      const vm = createMockVM({ name: 'no-cpu-vm', namespace: 'no-cpu-ns' });
      expect(getCPUUsagePercentage(vm, { cores: 4 })).toBeUndefined();
    });

    it('should handle multi-socket/core/thread CPU configuration', () => {
      setMetricFromResponse(
        createMockPrometheusResponse([{ name: 'complex-vm', namespace: 'complex-ns', value: 4 }]),
        Metric.cpuUsage,
      );

      const vm = createMockVM({ name: 'complex-vm', namespace: 'complex-ns' });
      expect(getCPUUsagePercentage(vm, { cores: 2, sockets: 2, threads: 2 })).toBe(50); // 4/8 vCPUs
    });
  });

  describe('getMemoryUsagePercentage', () => {
    it('should calculate memory usage percentage correctly', () => {
      setMetricFromResponse(
        createMockPrometheusResponse([
          { name: 'mem-vm', namespace: 'mem-ns', value: TWO_GIB_IN_BYTES },
        ]),
        Metric.memoryUsage,
      );

      const vm = createMockVM({ name: 'mem-vm', namespace: 'mem-ns' });
      expect(getMemoryUsagePercentage(vm, '4GiB')).toBeCloseTo(50, 0);
    });

    it('should return undefined when no memory data or invalid vmiMemory', () => {
      expect(
        getMemoryUsagePercentage(
          createMockVM({ name: 'no-mem-vm', namespace: 'no-mem-ns' }),
          '8GiB',
        ),
      ).toBeUndefined();
    });
  });

  describe('getNetworkUsagePercentage', () => {
    it('should return network usage value or undefined when no data', () => {
      setMetricFromResponse(
        createMockPrometheusResponse([
          { name: 'net-vm', namespace: 'net-ns', value: ONE_MIB_IN_BYTES },
        ]),
        Metric.networkUsage,
      );

      expect(getNetworkUsagePercentage(createMockVM({ name: 'net-vm', namespace: 'net-ns' }))).toBe(
        ONE_MIB_IN_BYTES,
      );
      expect(
        getNetworkUsagePercentage(createMockVM({ name: 'no-net-vm', namespace: 'no-net-ns' })),
      ).toBeUndefined();
    });
  });
});
