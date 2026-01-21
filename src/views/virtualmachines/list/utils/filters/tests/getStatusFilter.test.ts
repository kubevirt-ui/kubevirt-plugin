import {
  errorPrintableVMStatus,
  printableVMStatus,
} from '@virtualmachines/utils/virtualMachineStatuses';

import { getStatusFilter, statusFilterItems } from '../getStatusFilter';

import { createMockVM } from './mockVM';

// Mock translations
jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  t: (str: string) => str,
  useKubevirtTranslation: () => ({ t: (str: string) => str }),
}));

describe('VM Status Filter', () => {
  const statusFilter = getStatusFilter();

  describe('filter function', () => {
    it('should return true when no statuses are selected', () => {
      const vm = createMockVM({ status: { printableStatus: 'Running' } });
      const result = statusFilter.filter({ all: [], selected: [] }, vm);
      expect(result).toBe(true);
    });

    it('should return true when VM status matches selected status', () => {
      const vm = createMockVM({ status: { printableStatus: 'Running' } });
      const result = statusFilter.filter({ all: [], selected: ['Running'] }, vm);
      expect(result).toBe(true);
    });

    it('should return false when VM status does not match selected status', () => {
      const vm = createMockVM({ status: { printableStatus: 'Running' } });
      const result = statusFilter.filter({ all: [], selected: ['Stopped'] }, vm);
      expect(result).toBe(false);
    });

    it('should handle multiple selected statuses', () => {
      const runningVM = createMockVM({ status: { printableStatus: 'Running' } });
      const stoppedVM = createMockVM({ status: { printableStatus: 'Stopped' } });
      const pausedVM = createMockVM({ status: { printableStatus: 'Paused' } });

      const selected = ['Running', 'Stopped'];

      expect(statusFilter.filter({ all: [], selected }, runningVM)).toBe(true);
      expect(statusFilter.filter({ all: [], selected }, stoppedVM)).toBe(true);
      expect(statusFilter.filter({ all: [], selected }, pausedVM)).toBe(false);
    });

    describe('Error status handling', () => {
      const errorStatuses = Object.keys(errorPrintableVMStatus);

      it.each(errorStatuses)(
        'should match VM with %s status when Error filter is selected',
        (errorStatus) => {
          const vm = createMockVM({ status: { printableStatus: errorStatus } });
          const result = statusFilter.filter({ all: [], selected: ['Error'] }, vm);
          expect(result).toBe(true);
        },
      );

      it('should not match non-error status when only Error filter is selected', () => {
        const vm = createMockVM({ status: { printableStatus: 'Running' } });
        const result = statusFilter.filter({ all: [], selected: ['Error'] }, vm);
        expect(result).toBe(false);
      });
    });

    describe('all printable statuses', () => {
      const printableStatuses = Object.keys(printableVMStatus);

      it.each(printableStatuses)('should filter VM with %s status correctly', (status) => {
        const vm = createMockVM({ status: { printableStatus: status } });
        expect(statusFilter.filter({ all: [], selected: [status] }, vm)).toBe(true);
        expect(statusFilter.filter({ all: [], selected: ['SomeOtherStatus'] }, vm)).toBe(false);
      });
    });
  });

  describe('isMatch function', () => {
    it('should return true when filter status matches VM status', () => {
      const vm = createMockVM({ status: { printableStatus: 'Running' } });
      expect(statusFilter.isMatch(vm, 'Running')).toBe(true);
    });

    it('should return false when filter status does not match VM status', () => {
      const vm = createMockVM({ status: { printableStatus: 'Running' } });
      expect(statusFilter.isMatch(vm, 'Stopped')).toBe(false);
    });

    it('should match Error filter with error statuses', () => {
      const vm = createMockVM({ status: { printableStatus: 'CrashLoopBackOff' } });
      expect(statusFilter.isMatch(vm, 'Error')).toBe(true);
    });
  });

  describe('statusFilterItems', () => {
    it('should contain all printable statuses and Error', () => {
      const expectedStatuses = Object.keys(printableVMStatus).concat('Error');

      const itemIds = statusFilterItems.map((item) => item.id);
      expectedStatuses.forEach((status) => {
        expect(itemIds).toContain(status);
      });
    });
  });
});
