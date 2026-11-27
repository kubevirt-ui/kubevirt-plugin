import React from 'react';

import { type RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import FamilyAvailabilityCard from '../FamilyAvailabilityCard';

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => {
  const t = (key: string, options?: Record<string, string>) =>
    options ? key.replace(/{{(\w+)}}/g, (_match, name) => options[name]) : key;
  return {
    t,
    useKubevirtTranslation: () => ({ t }),
  };
});

const seriesItem = {
  classDisplayNameAnnotation: 'General Purpose',
  seriesName: 'u1',
} as unknown as RedHatInstanceTypeSeries;

const ERROR_TITLE = 'Failed to update family availability';

const getToggle = () =>
  screen.getByRole('switch', { name: 'Toggle availability for General Purpose' });

describe('FamilyAvailabilityCard', () => {
  it('toggles availability without showing an error', async () => {
    const setFamilyAvailable = jest.fn().mockResolvedValue(undefined);
    render(
      <FamilyAvailabilityCard
        isAvailable
        seriesItem={seriesItem}
        setFamilyAvailable={setFamilyAvailable}
      />,
    );

    fireEvent.click(screen.getByRole('switch'));

    await waitFor(() => expect(setFamilyAvailable).toHaveBeenCalledWith('u1', false));
    expect(screen.queryByText(ERROR_TITLE)).not.toBeInTheDocument();
  });

  it('shows an inline danger alert with the error message when the update fails', async () => {
    const setFamilyAvailable = jest.fn().mockRejectedValue(new Error('patch conflict'));
    render(
      <FamilyAvailabilityCard
        isAvailable
        seriesItem={seriesItem}
        setFamilyAvailable={setFamilyAvailable}
      />,
    );

    fireEvent.click(screen.getByRole('switch'));

    expect(await screen.findByText(ERROR_TITLE, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('patch conflict')).toBeInTheDocument();
  });

  it('closes the alert and clears it on retry', async () => {
    const setFamilyAvailable = jest
      .fn()
      .mockRejectedValueOnce(new Error('patch conflict'))
      .mockResolvedValueOnce(undefined);
    render(
      <FamilyAvailabilityCard
        isAvailable
        seriesItem={seriesItem}
        setFamilyAvailable={setFamilyAvailable}
      />,
    );

    fireEvent.click(screen.getByRole('switch'));
    expect(await screen.findByText('patch conflict')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByText('patch conflict')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('switch'));
    await waitFor(() => expect(setFamilyAvailable).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('patch conflict')).not.toBeInTheDocument();
  });

  it('calls setFamilyAvailable with the toggled value', async () => {
    const setFamilyAvailable = jest.fn().mockResolvedValue(undefined);
    render(
      <FamilyAvailabilityCard
        isAvailable={false}
        seriesItem={seriesItem}
        setFamilyAvailable={setFamilyAvailable}
      />,
    );

    fireEvent.click(getToggle());

    await waitFor(() => expect(setFamilyAvailable).toHaveBeenCalledWith('u1', true));
    await waitFor(() => expect(getToggle()).toBeEnabled());
  });

  it('re-enables the switch after the patch is rejected', async () => {
    const setFamilyAvailable = jest.fn().mockRejectedValue(new Error('conflict'));
    render(
      <FamilyAvailabilityCard
        isAvailable={false}
        seriesItem={seriesItem}
        setFamilyAvailable={setFamilyAvailable}
      />,
    );

    fireEvent.click(getToggle());

    expect(await screen.findByText(ERROR_TITLE, { exact: false })).toBeInTheDocument();
    await waitFor(() => expect(getToggle()).toBeEnabled());
  });

  it('renders an enabled switch without a read-only tooltip', () => {
    render(
      <FamilyAvailabilityCard isAvailable seriesItem={seriesItem} setFamilyAvailable={jest.fn()} />,
    );

    expect(getToggle()).toBeEnabled();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
