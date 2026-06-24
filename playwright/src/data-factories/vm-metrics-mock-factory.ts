/**
 * Factory for generating mocked Prometheus VM metrics responses.
 * Used to test the VM list table's Memory, CPU, and Network columns
 * without requiring real Prometheus data from running VMs (CNV-86695).
 *
 * The factory produces mock data matching the Prometheus instant query format
 * that the kubevirt-plugin uses to populate the VM table metric columns:
 * - kubevirt_vmi_memory_used_bytes (Memory column — displayed as % of request)
 * - kubevirt_vmi_cpu_usage_seconds_total rate (CPU column — displayed as %)
 * - kubevirt_vmi_network_transmit_bytes_total + receive rate (Network column — displayed as Bps)
 */

export interface VmMetricEntry {
  name: string;
  namespace: string;
  memoryBytes: string;
  cpuRate: string;
  networkRate: string;
}

export interface PrometheusVectorResponse {
  status: 'success';
  data: {
    resultType: 'vector';
    result: Array<{
      metric: { name: string; namespace: string };
      value: [number, string];
    }>;
    analysis: Record<string, never>;
  };
}

const GiB = 1_073_741_824;
const MiB = 1_048_576;

/**
 * Predefined VM metric profiles representing common workload patterns.
 * Values are captured from real cluster observations.
 */
const VM_PROFILES = {
  idle: {
    memoryBytes: String(256 * MiB),
    cpuRate: '0.001',
    networkRate: '0.1',
  },
  light: {
    memoryBytes: String(456 * MiB),
    cpuRate: '0.00432183908045976',
    networkRate: '0.871264367816092',
  },
  moderate: {
    memoryBytes: String(1 * GiB),
    cpuRate: '0.125',
    networkRate: '5242.88',
  },
  heavy: {
    memoryBytes: String(4 * GiB),
    cpuRate: '0.75',
    networkRate: '104857.6',
  },
} as const;

export type VmWorkloadProfile = keyof typeof VM_PROFILES;

/**
 * Create a single VM metrics entry using a named workload profile.
 */
export function createVmMetricEntry(
  name: string,
  namespace: string,
  profile: VmWorkloadProfile = 'light',
): VmMetricEntry {
  return { name, namespace, ...VM_PROFILES[profile] };
}

/**
 * Create a set of VM metrics entries representing a realistic cluster with
 * multiple running VMs at different workload levels.
 *
 * @param vmCount - Number of VMs to generate (default: 3)
 * @param namespace - Namespace for all VMs (default: 'default')
 * @param prefix - VM name prefix (default: 'mock-vm')
 */
export function createVmMetricsSet(
  vmCount = 3,
  namespace = 'default',
  prefix = 'mock-vm',
): VmMetricEntry[] {
  const profiles: VmWorkloadProfile[] = ['light', 'moderate', 'heavy', 'idle'];
  return Array.from({ length: vmCount }, (_, i) => ({
    name: `${prefix}-${i + 1}`,
    namespace,
    ...VM_PROFILES[profiles[i % profiles.length]],
  }));
}

/**
 * Build a Prometheus instant-query vector response from VM metric entries.
 * Used by page.route() mocks to fulfill Prometheus API requests.
 *
 * @param entries - The VM entries to include
 * @param valueExtractor - Function to extract the metric value from each entry
 */
export function buildPrometheusVectorResponse(
  entries: VmMetricEntry[],
  valueExtractor: (entry: VmMetricEntry) => string,
): PrometheusVectorResponse {
  return {
    status: 'success',
    data: {
      resultType: 'vector',
      result: entries.map((entry) => ({
        metric: { name: entry.name, namespace: entry.namespace },
        value: [Date.now() / 1000, valueExtractor(entry)],
      })),
      analysis: {},
    },
  };
}
