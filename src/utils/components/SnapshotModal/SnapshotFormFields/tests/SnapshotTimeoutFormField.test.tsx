import { act, fireEvent, render, screen } from '@testing-library/react';
import { TimeoutUnits } from '@virtualmachines/details/tabs/snapshots/utils/consts';

import SnapshotTimeoutFormField from '../SnapshotTimeoutFormField';

const defaultProps = {
  setIsError: jest.fn(),
  setSnapshotTimeout: jest.fn(),
  setSnapshotTimeoutUnit: jest.fn(),
  snapshotTimeout: '',
  snapshotTimeoutUnit: TimeoutUnits.Seconds,
};

const openTimeoutUnitSelect = async () => {
  const toggle = screen.getByRole('button', { name: 'Timeout unit' });
  await act(async () => {
    toggle.click();
  });
};

describe('SnapshotTimeoutFormField', () => {
  it('should render timeout unit options from TimeoutUnits enum only', async () => {
    render(<SnapshotTimeoutFormField {...defaultProps} />);

    await openTimeoutUnitSelect();

    const options = screen.getAllByRole('option');
    const expectedCount = Object.keys(TimeoutUnits).length;
    expect(options).toHaveLength(expectedCount);
    expect(expectedCount).toBe(3);
  });

  it('should not expose Milliseconds as a timeout unit option (regression)', async () => {
    render(<SnapshotTimeoutFormField {...defaultProps} />);

    await openTimeoutUnitSelect();
    const options = screen.getAllByRole('option');
    const optionLabels = options.map((opt) => opt.textContent ?? '');

    expect(optionLabels.some((label) => label.includes('Milliseconds'))).toBe(false);
    expect(optionLabels.some((label) => label.includes('ms'))).toBe(false);
  });

  it.each(Object.entries(TimeoutUnits))(
    'should expose %s (%s) as a timeout unit option',
    async (labelPart, valuePart) => {
      render(<SnapshotTimeoutFormField {...defaultProps} />);

      await openTimeoutUnitSelect();
      const options = screen.getAllByRole('option');
      const optionLabels = options.map((opt) => opt.textContent?.trim() ?? '');

      expect(optionLabels.some((l) => l.includes(labelPart) && l.includes(valuePart))).toBe(true);
    },
  );

  it('should update the timeout unit when an option is selected', async () => {
    const setSnapshotTimeoutUnit = jest.fn();
    render(
      <SnapshotTimeoutFormField
        {...defaultProps}
        setSnapshotTimeoutUnit={setSnapshotTimeoutUnit}
      />,
    );

    await openTimeoutUnitSelect();
    const minuteOption = screen.getByRole('option', { name: 'Minutes (m)' });
    await act(async () => {
      minuteOption.click();
    });

    expect(setSnapshotTimeoutUnit).toHaveBeenCalledWith(TimeoutUnits.Minutes);
  });

  it('should show validation error and disable submit for scientific notation (regression: CNV-96227)', () => {
    const setIsError = jest.fn();

    render(<SnapshotTimeoutFormField {...defaultProps} setIsError={setIsError} />);

    fireEvent.change(screen.getByRole('textbox', { name: /timeout/i }), {
      target: { value: '1e1' },
    });

    expect(screen.getByText('Timeout must be a number')).toBeInTheDocument();
    expect(setIsError).toHaveBeenLastCalledWith(true);
  });
});
