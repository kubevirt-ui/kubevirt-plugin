import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { deadlineUnits } from '@virtualmachines/details/tabs/snapshots/utils/consts';

import SnapshotDeadlineFormField from '../SnapshotDeadlineFormField';

const defaultProps = {
  deadline: '',
  deadlineUnit: deadlineUnits.Seconds,
  setDeadline: jest.fn(),
  setDeadlineUnit: jest.fn(),
  setIsError: jest.fn(),
};

describe('SnapshotDeadlineFormField', () => {
  it('should render deadline unit options from deadlineUnits enum only', () => {
    render(<SnapshotDeadlineFormField {...defaultProps} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    const expectedCount = Object.keys(deadlineUnits).length;
    expect(options).toHaveLength(expectedCount);
    expect(expectedCount).toBe(3);
  });

  it('should not expose Milliseconds as a deadline unit option (regression)', () => {
    render(<SnapshotDeadlineFormField {...defaultProps} />);

    const options = screen.getAllByRole('option');
    const optionLabels = options.map((opt) => opt.textContent ?? '');

    expect(optionLabels.some((label) => label.includes('Milliseconds'))).toBe(false);
    expect(optionLabels.some((label) => label.includes('ms'))).toBe(false);
  });

  it.each(Object.entries(deadlineUnits))(
    'should expose %s (%s) as a deadline unit option',
    (labelPart, valuePart) => {
      render(<SnapshotDeadlineFormField {...defaultProps} />);

      const options = screen.getAllByRole('option');
      const optionLabels = options.map((opt) => opt.textContent?.trim() ?? '');

      expect(optionLabels.some((l) => l.includes(labelPart) && l.includes(valuePart))).toBe(true);
    },
  );

  it('should show validation error and disable submit for scientific notation (regression: CNV-96227)', () => {
    const setIsError = jest.fn();

    render(<SnapshotDeadlineFormField {...defaultProps} setIsError={setIsError} />);

    fireEvent.change(screen.getByRole('textbox', { name: /deadline/i }), {
      target: { value: '1e1' },
    });

    expect(screen.getByText('Deadline must be a number')).toBeInTheDocument();
    expect(setIsError).toHaveBeenLastCalledWith(true);
  });
});
