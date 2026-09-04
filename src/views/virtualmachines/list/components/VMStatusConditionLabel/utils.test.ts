import { type V1VirtualMachineCondition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { formatConditionLabel, getConditionsDisplayValue } from './utils';

describe('formatConditionLabel', () => {
  it('formats type and status like the table labels', () => {
    expect(
      formatConditionLabel({
        status: 'True',
        type: 'DataVolumesReady',
      } as V1VirtualMachineCondition),
    ).toBe('DataVolumesReady=True');
  });

  it('returns an empty string when status is missing', () => {
    expect(
      formatConditionLabel({
        type: 'DataVolumesReady',
      } as V1VirtualMachineCondition),
    ).toBe('');
  });
});

describe('getConditionsDisplayValue', () => {
  it('joins condition labels with a comma', () => {
    expect(
      getConditionsDisplayValue([
        { status: 'True', type: 'DataVolumesReady' },
        { status: 'True', type: 'LiveMigratable' },
      ] as V1VirtualMachineCondition[]),
    ).toBe('DataVolumesReady=True, LiveMigratable=True');
  });

  it('returns a dash when there are no conditions', () => {
    expect(getConditionsDisplayValue(undefined)).toBe(NO_DATA_DASH);
    expect(getConditionsDisplayValue([])).toBe(NO_DATA_DASH);
  });

  it('omits conditions that are missing type or status', () => {
    expect(
      getConditionsDisplayValue([
        { type: 'DataVolumesReady' },
        { status: 'True' },
      ] as V1VirtualMachineCondition[]),
    ).toBe(NO_DATA_DASH);
  });
});
