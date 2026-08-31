import { type TFunction } from 'i18next';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ERROR_STATUS } from '@kubevirt-utils/resources/vm';
import {
  errorPrintableVMStatus,
  printableVMStatus,
} from '@virtualmachines/utils/virtualMachineStatuses';

import { getStatusFilter } from '../getStatusFilter';

import { createMockVM } from './mockVM';

describe('VM Status Filter', () => {
  const statusFilter = getStatusFilter(t as TFunction);

  describe('match function', () => {
    it('should return true when VM status matches selected status', () => {
      const vm = createMockVM({ status: { printableStatus: 'Running' } });
      expect(statusFilter.match(vm, ['Running'])).toBe(true);
    });

    it('should return false when VM status does not match selected status', () => {
      const vm = createMockVM({ status: { printableStatus: 'Running' } });
      expect(statusFilter.match(vm, ['Stopped'])).toBe(false);
    });

    it('should handle multiple selected statuses', () => {
      const runningVM = createMockVM({ status: { printableStatus: 'Running' } });
      const stoppedVM = createMockVM({ status: { printableStatus: 'Stopped' } });
      const pausedVM = createMockVM({ status: { printableStatus: 'Paused' } });

      const selected = ['Running', 'Stopped'];

      expect(statusFilter.match(runningVM, selected)).toBe(true);
      expect(statusFilter.match(stoppedVM, selected)).toBe(true);
      expect(statusFilter.match(pausedVM, selected)).toBe(false);
    });

    describe('Error status handling', () => {
      const errorStatuses = Object.keys(errorPrintableVMStatus);

      it.each(errorStatuses)(
        'should match VM with %s status when Error filter is selected',
        (errorStatus: string) => {
          const vm = createMockVM({ status: { printableStatus: errorStatus } });
          expect(statusFilter.match(vm, [ERROR_STATUS])).toBe(true);
        },
      );

      it('should not match non-error status when only Error filter is selected', () => {
        const vm = createMockVM({ status: { printableStatus: 'Running' } });
        expect(statusFilter.match(vm, [ERROR_STATUS])).toBe(false);
      });
    });

    describe('all printable statuses', () => {
      const printableStatuses = Object.keys(printableVMStatus);

      it.each(printableStatuses)('should filter VM with %s status correctly', (status: string) => {
        const vm = createMockVM({ status: { printableStatus: status } });
        expect(statusFilter.match(vm, [status])).toBe(true);
        expect(statusFilter.match(vm, ['SomeOtherStatus'])).toBe(false);
      });
    });
  });

  describe('options', () => {
    it('should contain all printable statuses and Error', () => {
      const expectedStatuses = [...Object.keys(printableVMStatus), ERROR_STATUS];

      const optionValues = statusFilter.options?.map((option) => option.value) ?? [];
      expect(optionValues).toHaveLength(expectedStatuses.length);
      expect(new Set(optionValues)).toEqual(new Set(expectedStatuses));
    });
  });
});
