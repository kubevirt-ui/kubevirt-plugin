import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { NumberOperator } from '@kubevirt-utils/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { convertFilterStateToModalInputs, convertModalInputsToFilterState } from './query';

describe('convertFilterStateToModalInputs', () => {
  describe('simple string fields', () => {
    it('should convert name filter to single string', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.Name]: ['my-vm'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Name]).toBe('my-vm');
    });

    it('should convert description filter to single string', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.Description]: ['database server'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Description]).toBe('database server');
    });

    it('should convert IP filter to single string', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.IP]: ['10.0.0.1'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.IP]).toBe('10.0.0.1');
    });

    it('should convert date fields to single strings', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.DateCreatedFrom]: ['2024-01-01'],
        [VirtualMachineRowFilterType.DateCreatedTo]: ['2024-12-31'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.DateCreatedFrom]).toBe('2024-01-01');
      expect(result[VirtualMachineRowFilterType.DateCreatedTo]).toBe('2024-12-31');
    });
  });

  describe('array fields', () => {
    it('should pass through status array', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.Status]: ['Running', 'Stopped'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Status]).toEqual(['Running', 'Stopped']);
    });

    it('should pass through OS array', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.OS]: ['RHEL', 'Windows'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.OS]).toEqual(['RHEL', 'Windows']);
    });

    it('should pass through project, labels, and node arrays', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.Labels]: ['app=db', 'env=prod'],
        [VirtualMachineRowFilterType.Node]: ['worker-01'],
        [VirtualMachineRowFilterType.Project]: ['default', 'openshift'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Labels]).toEqual(['app=db', 'env=prod']);
      expect(result[VirtualMachineRowFilterType.Node]).toEqual(['worker-01']);
      expect(result[VirtualMachineRowFilterType.Project]).toEqual(['default', 'openshift']);
    });
  });

  describe('CPU field', () => {
    it('should parse CPU value with GreaterThan operator', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.CPU]: ['GreaterThan 4'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.CPU]).toEqual({
        operator: NumberOperator.GreaterThan,
        value: 4,
      });
    });

    it('should parse CPU value with Equals operator', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.CPU]: ['Equals 8'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.CPU]).toEqual({
        operator: NumberOperator.Equals,
        value: 8,
      });
    });

    it('should skip malformed CPU value', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.CPU]: ['invalid'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.CPU]).toBeUndefined();
    });

    it('should skip CPU with non-numeric value', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.CPU]: ['GreaterThan abc'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.CPU]).toBeUndefined();
    });
  });

  describe('memory field', () => {
    it('should parse memory value with unit', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.Memory]: ['GreaterThan 2 GiB'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Memory]).toEqual({
        operator: NumberOperator.GreaterThan,
        unit: CAPACITY_UNITS.GiB,
        value: 2,
      });
    });

    it('should parse memory with MiB unit', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.Memory]: ['LessThan 512 MiB'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Memory]).toEqual({
        operator: NumberOperator.LessThan,
        unit: CAPACITY_UNITS.MiB,
        value: 512,
      });
    });

    it('should skip malformed memory value', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.Memory]: ['invalid'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Memory]).toBeUndefined();
    });

    it('should skip memory with unknown unit', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.Memory]: ['GreaterThan 2 PiB'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Memory]).toBeUndefined();
    });
  });

  describe('boolean-map fields', () => {
    it('should parse guest agent values', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.GuestAgent]: ['reporting'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.GuestAgent]).toEqual({
        notReporting: false,
        reporting: true,
      });
    });

    it('should parse hardware devices values', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.HWDevices]: ['gpu', 'host'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.HWDevices]).toEqual({
        gpu: true,
        host: true,
      });
    });

    it('should parse scheduling values', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.Scheduling]: ['nodeSelector'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Scheduling]).toEqual({
        affinityRules: false,
        nodeSelector: true,
      });
    });

    it('should ignore unknown boolean keys', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.GuestAgent]: ['unknownKey'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.GuestAgent]).toEqual({
        notReporting: false,
        reporting: false,
      });
    });
  });

  describe('edge cases', () => {
    it('should return empty object for empty filters', () => {
      const result = convertFilterStateToModalInputs({});

      expect(result).toEqual({});
    });

    it('should skip empty arrays', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.Status]: [],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Status]).toBeUndefined();
    });

    it('should handle multiple filter types simultaneously', () => {
      const filters: Partial<KubevirtFilterState> = {
        [VirtualMachineRowFilterType.CPU]: ['GreaterThan 4'],
        [VirtualMachineRowFilterType.Name]: ['my-vm'],
        [VirtualMachineRowFilterType.Status]: ['Running'],
      };

      const result = convertFilterStateToModalInputs(filters);

      expect(result[VirtualMachineRowFilterType.Name]).toBe('my-vm');
      expect(result[VirtualMachineRowFilterType.Status]).toEqual(['Running']);
      expect(result[VirtualMachineRowFilterType.CPU]).toEqual({
        operator: NumberOperator.GreaterThan,
        value: 4,
      });
    });
  });

  describe('round-trip with convertModalInputsToFilterState', () => {
    it('should round-trip simple array fields', () => {
      const original = { [VirtualMachineRowFilterType.Status]: ['Running', 'Stopped'] };
      const filterState = convertModalInputsToFilterState(original);
      const restored = convertFilterStateToModalInputs(filterState);

      expect(restored[VirtualMachineRowFilterType.Status]).toEqual(
        original[VirtualMachineRowFilterType.Status],
      );
    });

    it('should round-trip CPU values', () => {
      const original = {
        [VirtualMachineRowFilterType.CPU]: {
          operator: NumberOperator.GreaterThan,
          value: 4,
        },
      };
      const filterState = convertModalInputsToFilterState(original);
      const restored = convertFilterStateToModalInputs(filterState);

      expect(restored[VirtualMachineRowFilterType.CPU]).toEqual(
        original[VirtualMachineRowFilterType.CPU],
      );
    });

    it('should round-trip memory values', () => {
      const original = {
        [VirtualMachineRowFilterType.Memory]: {
          operator: NumberOperator.LessOrEquals,
          unit: CAPACITY_UNITS.TiB,
          value: 1,
        },
      };
      const filterState = convertModalInputsToFilterState(original);
      const restored = convertFilterStateToModalInputs(filterState);

      expect(restored[VirtualMachineRowFilterType.Memory]).toEqual(
        original[VirtualMachineRowFilterType.Memory],
      );
    });

    it('should round-trip boolean-map fields', () => {
      const original = {
        [VirtualMachineRowFilterType.GuestAgent]: { notReporting: false, reporting: true },
        [VirtualMachineRowFilterType.HWDevices]: { gpu: true, host: false },
        [VirtualMachineRowFilterType.Scheduling]: { affinityRules: true, nodeSelector: false },
      };
      const filterState = convertModalInputsToFilterState(original);
      const restored = convertFilterStateToModalInputs(filterState);

      expect(restored[VirtualMachineRowFilterType.GuestAgent]).toEqual(
        original[VirtualMachineRowFilterType.GuestAgent],
      );
      expect(restored[VirtualMachineRowFilterType.HWDevices]).toEqual(
        original[VirtualMachineRowFilterType.HWDevices],
      );
      expect(restored[VirtualMachineRowFilterType.Scheduling]).toEqual(
        original[VirtualMachineRowFilterType.Scheduling],
      );
    });
  });
});
