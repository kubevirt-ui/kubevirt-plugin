import React from 'react';

import { type RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import FamilyAvailabilityCard from './FamilyAvailabilityCard';

// release-5.0's default Jest translation mock does not interpolate {{placeholders}}.
jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => {
  const t = (key: string, options?: Record<string, unknown>): string =>
    Object.entries(options ?? {}).reduce(
      (text, [name, value]) => text.split(`{{${name}}}`).join(String(value)),
      key,
    );
  return { __esModule: true, useKubevirtTranslation: () => ({ t }) };
});

const mockAddDangerToast = jest.fn();

jest.mock('@kubevirt-utils/hooks/useKubevirtToast', () => ({
  __esModule: true,
  default: () => ({ addDangerToast: mockAddDangerToast }),
}));

const seriesItem = {
  classDisplayNameAnnotation: 'General Purpose',
  classLabel: 'u1',
  seriesName: 'u1',
  sizes: [],
} as unknown as RedHatInstanceTypeSeries;

const getToggle = () =>
  screen.getByRole('switch', { name: 'Toggle availability for General Purpose' });

describe('FamilyAvailabilityCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls setFamilyAvailable with the toggled value', async () => {
    const setFamilyAvailable = jest.fn().mockResolvedValue(undefined);
    render(
      <FamilyAvailabilityCard
        isAvailable
        seriesItem={seriesItem}
        setFamilyAvailable={setFamilyAvailable}
      />,
    );

    fireEvent.click(getToggle());

    await waitFor(() => expect(setFamilyAvailable).toHaveBeenCalledWith('u1', false));
    expect(mockAddDangerToast).not.toHaveBeenCalled();
  });

  it('shows a danger toast when the patch is rejected', async () => {
    const setFamilyAvailable = jest.fn().mockRejectedValue(new Error('conflict'));
    render(
      <FamilyAvailabilityCard
        isAvailable={false}
        seriesItem={seriesItem}
        setFamilyAvailable={setFamilyAvailable}
      />,
    );

    fireEvent.click(getToggle());

    await waitFor(() =>
      expect(mockAddDangerToast).toHaveBeenCalledWith({
        title: 'Failed to update family availability',
      }),
    );
    await waitFor(() => expect(getToggle()).toBeEnabled());
  });

  it('renders an enabled switch without a read-only tooltip wrapper', () => {
    render(
      <FamilyAvailabilityCard isAvailable seriesItem={seriesItem} setFamilyAvailable={jest.fn()} />,
    );

    expect(getToggle()).toBeEnabled();
    // eslint-disable-next-line testing-library/no-node-access
    expect(getToggle().closest('span[tabindex="0"]')).toBeNull();
  });
});
