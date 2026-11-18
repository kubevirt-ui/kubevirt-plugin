import { type RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import FamilyAvailabilityCard from './FamilyAvailabilityCard';

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
        cluster="spoke-a"
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

  it('isReadOnly disables the switch and shows the permission tooltip', async () => {
    const setFamilyAvailable = jest.fn();
    render(
      <FamilyAvailabilityCard
        cluster="spoke-b"
        isAvailable
        isReadOnly
        seriesItem={seriesItem}
        setFamilyAvailable={setFamilyAvailable}
      />,
    );

    expect(getToggle()).toBeDisabled();
    fireEvent.click(getToggle());
    expect(setFamilyAvailable).not.toHaveBeenCalled();

    // The disabled input cannot receive focus, so the tooltip trigger is its focusable wrapper.
    // eslint-disable-next-line testing-library/no-node-access
    const wrapper = getToggle().closest('span[tabindex="0"]');
    expect(wrapper).not.toBeNull();
    fireEvent.focus(wrapper as HTMLElement);

    expect(
      await screen.findByText(
        'You do not have permission to change instance type family availability on cluster spoke-b.',
      ),
    ).toBeInTheDocument();
  });

  it('does not render a tooltip wrapper when editable', () => {
    render(
      <FamilyAvailabilityCard isAvailable seriesItem={seriesItem} setFamilyAvailable={jest.fn()} />,
    );

    expect(getToggle()).toBeEnabled();
    // eslint-disable-next-line testing-library/no-node-access
    expect(getToggle().closest('span[tabindex="0"]')).toBeNull();
  });
});
