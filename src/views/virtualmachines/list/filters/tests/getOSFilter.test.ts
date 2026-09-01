import { type TFunction } from 'i18next';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAME_LABELS } from '@kubevirt-utils/resources/template';

import { getOSFilter, getOSName } from '../getOSFilter';

import { createMockVM } from './mockVM';

describe('VM OS Filter', () => {
  const osFilter = getOSFilter(t as TFunction);

  describe('match function', () => {
    it('should return true when VM OS matches selected OS', () => {
      const vm = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'rhel9',
              },
            },
          },
        },
      });
      expect(osFilter.match(vm, [OS_NAME_LABELS.rhel])).toBe(true);
    });
  });

  describe('OS detection via annotation (vm.kubevirt.io/os)', () => {
    const testCases = [
      { annotation: 'rhel9', expectedOS: OS_NAME_LABELS.rhel },
      { annotation: 'rhel8.5', expectedOS: OS_NAME_LABELS.rhel },
      { annotation: 'RHEL-9', expectedOS: OS_NAME_LABELS.rhel },
      { annotation: 'windows10', expectedOS: OS_NAME_LABELS.windows },
      { annotation: 'Windows2019', expectedOS: OS_NAME_LABELS.windows },
      { annotation: 'win11', expectedOS: OS_NAME_LABELS.windows },
      { annotation: 'fedora38', expectedOS: OS_NAME_LABELS.fedora },
      { annotation: 'Fedora-39', expectedOS: OS_NAME_LABELS.fedora },
      { annotation: 'centos7', expectedOS: OS_NAME_LABELS.centos },
      { annotation: 'CentOS-Stream-9', expectedOS: OS_NAME_LABELS.centos },
    ];

    it.each(testCases)(
      'should detect $expectedOS from annotation "$annotation"',
      ({ annotation, expectedOS }: { annotation: string; expectedOS: string }) => {
        const vm = createMockVM({
          spec: {
            template: {
              metadata: {
                annotations: {
                  'vm.kubevirt.io/os': annotation,
                },
              },
            },
          },
        });
        expect(osFilter.match(vm, [expectedOS])).toBe(true);
      },
    );
  });

  describe('OS detection via os.template.kubevirt.io label', () => {
    const testCases = [
      { expectedOS: OS_NAME_LABELS.rhel, label: 'rhel9' },
      { expectedOS: OS_NAME_LABELS.fedora, label: 'fedora38' },
      { expectedOS: OS_NAME_LABELS.centos, label: 'centos-stream9' },
      { expectedOS: OS_NAME_LABELS.windows, label: 'win2k22' },
    ];

    it.each(testCases)(
      'should detect $expectedOS from label "os.template.kubevirt.io/$label"',
      ({ expectedOS, label }: { expectedOS: string; label: string }) => {
        const vm = createMockVM({
          metadata: {
            labels: {
              [`os.template.kubevirt.io/${label}`]: 'true',
            },
            name: 'test-vm',
            namespace: 'default',
          },
        });
        expect(osFilter.match(vm, [expectedOS])).toBe(true);
      },
    );
  });

  describe('OS detection via preference name', () => {
    const testCases = [
      { expectedOS: OS_NAME_LABELS.rhel, preferenceName: 'rhel.9' },
      { expectedOS: OS_NAME_LABELS.rhel, preferenceName: 'rhel.8.5' },
      { expectedOS: OS_NAME_LABELS.windows, preferenceName: 'windows.11' },
      { expectedOS: OS_NAME_LABELS.windows, preferenceName: 'windows.2022' },
      { expectedOS: OS_NAME_LABELS.fedora, preferenceName: 'fedora' },
      { expectedOS: OS_NAME_LABELS.centos, preferenceName: 'centos.stream9' },
    ];

    it.each(testCases)(
      'should detect $expectedOS from preference name "$preferenceName"',
      ({ expectedOS, preferenceName }: { expectedOS: string; preferenceName: string }) => {
        const vm = createMockVM({
          spec: {
            preference: {
              name: preferenceName,
            },
            template: {},
          },
        });
        expect(osFilter.match(vm, [expectedOS])).toBe(true);
      },
    );
  });

  describe('case insensitivity', () => {
    it('should match OS regardless of case in annotation', () => {
      const vmLower = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'rhel9',
              },
            },
          },
        },
      });
      const vmUpper = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'RHEL9',
              },
            },
          },
        },
      });
      const vmMixed = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'RhEl9',
              },
            },
          },
        },
      });

      expect(osFilter.match(vmLower, [OS_NAME_LABELS.rhel])).toBe(true);
      expect(osFilter.match(vmUpper, [OS_NAME_LABELS.rhel])).toBe(true);
      expect(osFilter.match(vmMixed, [OS_NAME_LABELS.rhel])).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return undefined for VM with no OS information', () => {
      const vm = createMockVM();
      expect(getOSName(vm)).toBeUndefined();
    });

    it('should handle multiple selected OS types', () => {
      const rhelVM = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'rhel9',
              },
            },
          },
        },
      });
      const windowsVM = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'windows11',
              },
            },
          },
        },
      });
      const fedoraVM = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'fedora38',
              },
            },
          },
        },
      });

      const selected = [OS_NAME_LABELS.rhel, OS_NAME_LABELS.windows];

      expect(osFilter.match(rhelVM, selected)).toBe(true);
      expect(osFilter.match(windowsVM, selected)).toBe(true);
      expect(osFilter.match(fedoraVM, selected)).toBe(false);
    });

    it('should match OS with custom suffix when it starts with valid OS prefix', () => {
      const vm = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'rhelish-custom-os',
              },
            },
          },
        },
      });
      expect(osFilter.match(vm, [OS_NAME_LABELS.rhel])).toBe(true);
    });
  });

  describe('filter exclusion', () => {
    it('should return false when RHEL VM does not match Windows filter', () => {
      const vm = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'rhel9',
              },
            },
          },
        },
      });
      expect(osFilter.match(vm, [OS_NAME_LABELS.windows])).toBe(false);
    });

    it('should return false when VM has no OS and a filter is selected', () => {
      const vm = createMockVM();
      expect(osFilter.match(vm, [OS_NAME_LABELS.rhel])).toBe(false);
      expect(osFilter.match(vm, [OS_NAME_LABELS.windows])).toBe(false);
    });

    it('should return false when VM OS does not match any of multiple selected filters', () => {
      const centosVM = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'centos9',
              },
            },
          },
        },
      });
      expect(osFilter.match(centosVM, [OS_NAME_LABELS.rhel, OS_NAME_LABELS.windows])).toBe(false);
    });

    it('should return false for unknown OS when known OS filter is selected', () => {
      const vm = createMockVM({
        spec: {
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'ubuntu22.04',
              },
            },
          },
        },
      });
      expect(osFilter.match(vm, [OS_NAME_LABELS.rhel])).toBe(false);
      expect(osFilter.match(vm, [OS_NAME_LABELS.windows])).toBe(false);
      expect(osFilter.match(vm, [OS_NAME_LABELS.fedora])).toBe(false);
    });
  });

  describe('options', () => {
    it('should contain all OS types', () => {
      const expectedOSTypes = Object.values(OS_NAME_LABELS);
      const optionValues = osFilter.options?.map((option) => option.value);

      for (const os of expectedOSTypes) {
        expect(optionValues).toContain(os);
      }
    });
  });

  describe('priority of OS detection methods', () => {
    it('should detect OS from annotation even when preference is also set', () => {
      const vm = createMockVM({
        spec: {
          preference: {
            name: 'windows.11',
          },
          template: {
            metadata: {
              annotations: {
                'vm.kubevirt.io/os': 'rhel9',
              },
            },
          },
        },
      });
      expect(osFilter.match(vm, [OS_NAME_LABELS.rhel])).toBe(true);
    });
  });
});
