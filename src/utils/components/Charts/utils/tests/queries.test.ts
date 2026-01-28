import { getUtilizationQueries, VMQueries } from '../queries';

// Duration Constants
const DEFAULT_DURATION = '5m';
const EXTENDED_DURATION = '15m';

// Cluster Constants
const HUB_CLUSTER_NAME = 'local-cluster';
const MANAGED_CLUSTER_NAME = 'managed-cluster-1';
const ANY_CLUSTER_NAME = 'any-cluster';

// VM Constants
const VM_API_VERSION = 'kubevirt.io/v1';
const VM_KIND = 'VirtualMachine';
const DEFAULT_VM_NAME = 'test-vm';
const DEFAULT_NAMESPACE = 'test-namespace';
const TEST_VM_NAME = 'my-vm';
const TEST_NAMESPACE = 'my-namespace';
const TEST_NAMESPACE_SHORT = 'my-ns';

// Query Structure Constants
const BY_CLAUSE_HUB = 'BY (name, namespace)';
const BY_CLAUSE_MANAGED = 'BY (name, namespace, cluster)';

describe('getUtilizationQueries', () => {
  const createMockVMObj = (
    overrides: {
      cluster?: string;
      name?: string;
      namespace?: string;
    } = {},
  ) => ({
    apiVersion: VM_API_VERSION,
    cluster: overrides.cluster,
    kind: VM_KIND,
    metadata: {
      name: overrides.name ?? DEFAULT_VM_NAME,
      namespace: overrides.namespace ?? DEFAULT_NAMESPACE,
    },
  });

  describe('multicluster cluster filter logic', () => {
    it('should NOT include cluster filter for hub cluster VMs', () => {
      const hubVM = createMockVMObj({ cluster: HUB_CLUSTER_NAME });

      const queries = getUtilizationQueries({
        duration: DEFAULT_DURATION,
        hubClusterName: HUB_CLUSTER_NAME,
        obj: hubVM,
      });

      expect(queries[VMQueries.CPU_USAGE]).not.toContain('cluster=');
      expect(queries[VMQueries.CPU_USAGE]).toContain(`name='${DEFAULT_VM_NAME}'`);
      expect(queries[VMQueries.CPU_USAGE]).toContain(BY_CLAUSE_HUB);
      expect(queries[VMQueries.MEMORY_USAGE]).not.toContain('cluster=');
    });

    it('should include cluster filter and BY clause for managed cluster VMs', () => {
      const managedVM = createMockVMObj({ cluster: MANAGED_CLUSTER_NAME });

      const queries = getUtilizationQueries({
        duration: DEFAULT_DURATION,
        hubClusterName: HUB_CLUSTER_NAME,
        obj: managedVM,
      });

      expect(queries[VMQueries.CPU_USAGE]).toContain(`cluster='${MANAGED_CLUSTER_NAME}'`);
      expect(queries[VMQueries.CPU_USAGE]).toContain(BY_CLAUSE_MANAGED);
      expect(queries[VMQueries.MEMORY_USAGE]).toContain(`cluster='${MANAGED_CLUSTER_NAME}'`);
      expect(queries[VMQueries.NETWORK_IN_USAGE]).toContain(`cluster='${MANAGED_CLUSTER_NAME}'`);
      expect(queries[VMQueries.STORAGE_READ_LATENCY_AVG]).toContain(
        `cluster='${MANAGED_CLUSTER_NAME}'`,
      );
    });
  });

  describe('query structure validation', () => {
    it('should generate correct CPU and memory query structure for hub cluster', () => {
      const vm = createMockVMObj({ name: TEST_VM_NAME, namespace: TEST_NAMESPACE });

      const queries = getUtilizationQueries({
        duration: EXTENDED_DURATION,
        hubClusterName: HUB_CLUSTER_NAME,
        obj: vm,
      });

      expect(queries[VMQueries.CPU_USAGE]).toBe(
        `sum(rate(kubevirt_vmi_cpu_usage_seconds_total{name='${TEST_VM_NAME}',namespace='${TEST_NAMESPACE}'}[${EXTENDED_DURATION}])) ${BY_CLAUSE_HUB}`,
      );
      expect(queries[VMQueries.MEMORY_USAGE]).toBe(
        `last_over_time(kubevirt_vmi_memory_used_bytes{name='${TEST_VM_NAME}',namespace='${TEST_NAMESPACE}'}[${EXTENDED_DURATION}])`,
      );
    });

    it('should generate correct query structure for managed cluster', () => {
      const managedVM = createMockVMObj({
        cluster: MANAGED_CLUSTER_NAME,
        name: TEST_VM_NAME,
        namespace: TEST_NAMESPACE,
      });

      const queries = getUtilizationQueries({
        duration: EXTENDED_DURATION,
        hubClusterName: HUB_CLUSTER_NAME,
        obj: managedVM,
      });

      expect(queries[VMQueries.CPU_USAGE]).toBe(
        `sum(rate(kubevirt_vmi_cpu_usage_seconds_total{name='${TEST_VM_NAME}',namespace='${TEST_NAMESPACE}',cluster='${MANAGED_CLUSTER_NAME}'}[${EXTENDED_DURATION}])) ${BY_CLAUSE_MANAGED}`,
      );
    });

    it('should generate correct storage latency query structure', () => {
      const vm = createMockVMObj({ name: TEST_VM_NAME, namespace: TEST_NAMESPACE_SHORT });

      const queries = getUtilizationQueries({
        duration: DEFAULT_DURATION,
        hubClusterName: HUB_CLUSTER_NAME,
        obj: vm,
      });

      expect(queries[VMQueries.STORAGE_READ_LATENCY_AVG]).toBe(
        `avg by (name, namespace)(rate(kubevirt_vmi_storage_read_times_seconds_total{name='${TEST_VM_NAME}',namespace='${TEST_NAMESPACE_SHORT}'}[${DEFAULT_DURATION}]) / rate(kubevirt_vmi_storage_iops_read_total{name='${TEST_VM_NAME}',namespace='${TEST_NAMESPACE_SHORT}'}[${DEFAULT_DURATION}]) > 0)`,
      );
    });
  });

  describe('query completeness', () => {
    it('should return all expected query types and apply cluster filter consistently', () => {
      const managedVM = createMockVMObj({ cluster: MANAGED_CLUSTER_NAME });

      const queries = getUtilizationQueries({
        duration: DEFAULT_DURATION,
        hubClusterName: HUB_CLUSTER_NAME,
        obj: managedVM,
      });

      // Verify key query types are present
      expect(queries[VMQueries.CPU_USAGE]).toBeDefined();
      expect(queries[VMQueries.MEMORY_USAGE]).toBeDefined();
      expect(queries[VMQueries.NETWORK_IN_USAGE]).toBeDefined();
      expect(queries[VMQueries.STORAGE_READ_LATENCY_AVG]).toBeDefined();
      expect(queries[VMQueries.MIGRATION_DATA_PROCESSED]).toBeDefined();

      // All query types should have the cluster filter for managed cluster
      Object.values(queries).forEach((query) => {
        expect(query).toContain(`cluster='${MANAGED_CLUSTER_NAME}'`);
      });
    });
  });

  describe('edge cases', () => {
    it('should treat any cluster as managed when hubClusterName is undefined', () => {
      const vmWithCluster = createMockVMObj({ cluster: ANY_CLUSTER_NAME });

      const queries = getUtilizationQueries({
        duration: DEFAULT_DURATION,
        hubClusterName: undefined,
        obj: vmWithCluster,
      });

      // When hubClusterName is undefined, any VM with a cluster should be treated as managed
      // because obj?.cluster !== undefined is true
      expect(queries[VMQueries.CPU_USAGE]).toContain(`cluster='${ANY_CLUSTER_NAME}'`);
      expect(queries[VMQueries.CPU_USAGE]).toContain(BY_CLAUSE_MANAGED);
    });

    it('should NOT include cluster filter when both hubClusterName and VM cluster are undefined', () => {
      const vmWithoutCluster = createMockVMObj({});

      const queries = getUtilizationQueries({
        duration: DEFAULT_DURATION,
        hubClusterName: undefined,
        obj: vmWithoutCluster,
      });

      // When VM has no cluster, it should not have cluster filter regardless of hubClusterName
      expect(queries[VMQueries.CPU_USAGE]).not.toContain('cluster=');
      expect(queries[VMQueries.CPU_USAGE]).toContain(BY_CLAUSE_HUB);
    });
  });
});
