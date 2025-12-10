import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';

import { SELF_VALIDATION_RESULTS_KEY } from './constants';
import { parseFailedTest, parseResults } from './selfValidationResults';

describe('parseResults', () => {
  describe('YAML parsing', () => {
    it('should parse YAML file with summary and test suites', () => {
      const yamlContent = `summary:
  total_tests_run: 100
  total_tests_passed: 85
  total_tests_failed: 10
  total_tests_skipped: 5
compute:
  tests_run: 30
  tests_passed: 28
  tests_failures: 2
  tests_skipped: 0
  tests_duration: "45m30s"
  failed_tests:
    - "[sig-compute]VMIlifecycle Creating a VirtualMachineInstance should start in paused state"
    - "[sig-compute]SecurityFeatures Check virt-launcher capabilities has precisely the documented extra capabilities"
network:
  tests_run: 40
  tests_passed: 35
  tests_failures: 5
  tests_skipped: 0
  tests_duration: "52m15s"
  failed_tests:
    - |
      [sig-network] [level:component]Networkpolicy
      when three alpine VMs with default networking are started
      and serverVMI start an HTTP server on port 80 and 81
      should succeed pinging between two VMI/s in the same namespace
storage:
  tests_run: 30
  tests_passed: 22
  tests_failures: 3
  tests_skipped: 5
  tests_duration: "38m45s"
  failed_tests:
    - "[sig-storage] Volumes update with migration should migrate the source volume"`;

      const configMap: IoK8sApiCoreV1ConfigMap = {
        data: {
          [SELF_VALIDATION_RESULTS_KEY]: yamlContent,
        },
      };

      const result = parseResults(configMap);

      expect(result).not.toBeNull();
      expect(result?.summary).toEqual({
        total_tests_failed: 10,
        total_tests_passed: 85,
        total_tests_run: 100,
        total_tests_skipped: 5,
      });
      expect(result?.compute).toEqual({
        failed_tests: [
          '[sig-compute]VMIlifecycle Creating a VirtualMachineInstance should start in paused state',
          '[sig-compute]SecurityFeatures Check virt-launcher capabilities has precisely the documented extra capabilities',
        ],
        tests_duration: '45m30s',
        tests_failures: 2,
        tests_passed: 28,
        tests_run: 30,
        tests_skipped: 0,
      });
      expect(result?.network).toEqual({
        failed_tests: [
          `[sig-network] [level:component]Networkpolicy
when three alpine VMs with default networking are started
and serverVMI start an HTTP server on port 80 and 81
should succeed pinging between two VMI/s in the same namespace
`,
        ],
        tests_duration: '52m15s',
        tests_failures: 5,
        tests_passed: 35,
        tests_run: 40,
        tests_skipped: 0,
      });
      expect(result?.storage).toEqual({
        failed_tests: [
          '[sig-storage] Volumes update with migration should migrate the source volume',
        ],
        tests_duration: '38m45s',
        tests_failures: 3,
        tests_passed: 22,
        tests_run: 30,
        tests_skipped: 5,
      });
    });

    it('should parse YAML file with minimal summary only', () => {
      const yamlContent = `summary:
  total_tests_run: 50
  total_tests_passed: 50
  total_tests_failed: 0
  total_tests_skipped: 0`;

      const configMap: IoK8sApiCoreV1ConfigMap = {
        data: {
          [SELF_VALIDATION_RESULTS_KEY]: yamlContent,
        },
      };

      const result = parseResults(configMap);

      expect(result).not.toBeNull();
      expect(result?.summary).toEqual({
        total_tests_failed: 0,
        total_tests_passed: 50,
        total_tests_run: 50,
        total_tests_skipped: 0,
      });
    });

    it('should return null for invalid YAML', () => {
      const invalidYaml = `summary:
  total_tests_run: 100
invalid: [unclosed bracket`;

      const configMap: IoK8sApiCoreV1ConfigMap = {
        data: {
          [SELF_VALIDATION_RESULTS_KEY]: invalidYaml,
        },
      };

      const result = parseResults(configMap);

      expect(result).toBeNull();
    });

    it('should return null when ConfigMap data is missing', () => {
      const configMap: IoK8sApiCoreV1ConfigMap = {
        data: {},
      };

      const result = parseResults(configMap);

      expect(result).toBeNull();
    });

    it('should return null when ConfigMap is null', () => {
      const result = parseResults(null as any);

      expect(result).toBeNull();
    });
  });
});

describe('parseFailedTest', () => {
  describe('Multi-line text parsing', () => {
    it('should parse multi-line text with tags and description', () => {
      const testName = `[sig-network] [level:component]Networkpolicy
when three alpine VMs with default networking are started
and serverVMI start an HTTP server on port 80 and 81
and vms limited by allow same namespace networkpolicy
when client vmi is on default namespace
should succeed pinging between two VMI/s in the same namespace`;

      const result = parseFailedTest(testName);

      expect(result.title).toBe('[sig-network] [level:component]Networkpolicy');
      expect(result.description).toBe(
        `when three alpine VMs with default networking are started
and serverVMI start an HTTP server on port 80 and 81
and vms limited by allow same namespace networkpolicy
when client vmi is on default namespace
should succeed pinging between two VMI/s in the same namespace`,
      );
    });

    it('should parse multi-line text with multiple tags and text after tags', () => {
      const testName = `[rfe_id:273][crit:high][vendor:cnv-qe@redhat.com][level:component][sig-compute]VMIlifecycle
Creating a VirtualMachineInstance
should start in paused state if start strategy set to paused`;

      const result = parseFailedTest(testName);

      expect(result.title).toBe(
        '[rfe_id:273][crit:high][vendor:cnv-qe@redhat.com][level:component][sig-compute]VMIlifecycle',
      );
      expect(result.description).toBe(
        `Creating a VirtualMachineInstance
should start in paused state if start strategy set to paused`,
      );
    });

    it('should parse multi-line text with tags separated by spaces', () => {
      const testName = `[sig-network] [rfe_id:694] [crit:medium] Networking
VirtualMachineInstance with masquerade binding mechanism
should allow regular network connection ipv4 with a specific port number`;

      const result = parseFailedTest(testName);

      expect(result.title).toBe('[sig-network] [rfe_id:694] [crit:medium]');
      expect(result.description).toBe(
        `Networking
VirtualMachineInstance with masquerade binding mechanism
should allow regular network connection ipv4 with a specific port number`,
      );
    });

    it('should parse multi-line text with tags and immediate text after tags', () => {
      const testName = `[sig-compute]SecurityFeatures Check virt-launcher capabilities
has precisely the documented extra capabilities relative to a regular user pod`;

      const result = parseFailedTest(testName);

      expect(result.title).toBe('[sig-compute]SecurityFeatures');
      expect(result.description).toBe(
        `Check virt-launcher capabilities
has precisely the documented extra capabilities relative to a regular user pod`,
      );
    });

    it('should parse multi-line text with complex multi-line description', () => {
      const testName = `[sig-storage] Volumes update with migration
Update volumes with the migration updateVolumesStrategy
should migrate the source volume from a source and destination block RWX DVs`;

      const result = parseFailedTest(testName);

      expect(result.title).toBe('[sig-storage]');
      expect(result.description).toBe(
        `Volumes update with migration
Update volumes with the migration updateVolumesStrategy
should migrate the source volume from a source and destination block RWX DVs`,
      );
    });
  });

  describe('Single-line parsing', () => {
    it('should parse single-line test name with tags', () => {
      const testName = '[sig-network] [level:component]Networkpolicy should work';

      const result = parseFailedTest(testName);

      expect(result.title).toBe('[sig-network] [level:component]Networkpolicy');
      expect(result.description).toBe('should work');
    });

    it('should parse single-line test name with tags and immediate text', () => {
      const testName = '[sig-compute]VMIlifecycle Creating a VirtualMachineInstance should work';

      const result = parseFailedTest(testName);

      expect(result.title).toBe('[sig-compute]VMIlifecycle');
      expect(result.description).toBe('Creating a VirtualMachineInstance should work');
    });
  });

  describe('Edge cases', () => {
    it('should handle test name without tags', () => {
      const testName = 'Simple test name without any tags';

      const result = parseFailedTest(testName);

      expect(result.title).toBe('');
      expect(result.description).toBe('Simple test name without any tags');
    });

    it('should handle empty string', () => {
      const result = parseFailedTest('');

      expect(result.title).toBe('');
      expect(result.description).toBe('');
    });

    it('should handle test name with only tags', () => {
      const testName = '[sig-network] [level:component]';

      const result = parseFailedTest(testName);

      expect(result.title).toBe('[sig-network] [level:component]');
      // When there's only tags, description falls back to trimmedTestName per the function logic
      expect(result.description).toBe('[sig-network] [level:component]');
    });

    it('should trim whitespace', () => {
      const testName = `  [sig-network] Networkpolicy  
  should work  `;

      const result = parseFailedTest(testName);

      expect(result.title).toBe('[sig-network]');
      expect(result.description).toBe(`Networkpolicy  
  should work`);
    });

    it('should handle tags with text immediately after (no space)', () => {
      const testName = '[sig-compute]VMIlifecycle should work';

      const result = parseFailedTest(testName);

      expect(result.title).toBe('[sig-compute]VMIlifecycle');
      expect(result.description).toBe('should work');
    });
  });
});
