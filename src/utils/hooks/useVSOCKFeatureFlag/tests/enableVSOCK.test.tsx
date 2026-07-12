import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EnableVSOCK from '../../../components/EnableVSOCK/EnableVSOCK';

import { createVM, mockFeatureEnabled, resetVSOCKMocks } from './mocks';

jest.mock('@kubevirt-utils/hooks/useVSOCKFeatureFlag/useIsVSOCKFeatureEnabled', () => ({
  __esModule: true,
  default: () => mockFeatureEnabled(),
}));

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: () => ({ t: (key: string) => key }),
}));

describe('EnableVSOCK — editing VSOCK on an existing VM', () => {
  const updateVSOCK = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    resetVSOCKMocks();
    updateVSOCK.mockClear();
  });

  it('should render OFF for a VM without VSOCK', () => {
    render(<EnableVSOCK updateVSOCK={updateVSOCK} vm={createVM()} />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('should render ON for a VM with VSOCK', () => {
    render(<EnableVSOCK updateVSOCK={updateVSOCK} vm={createVM({ autoattachVSOCK: true })} />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('should turn VSOCK ON when user clicks the toggle', async () => {
    render(<EnableVSOCK updateVSOCK={updateVSOCK} vm={createVM()} />);

    await userEvent.click(screen.getByRole('switch'));

    expect(updateVSOCK).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('should turn VSOCK OFF when user clicks the toggle', async () => {
    render(<EnableVSOCK updateVSOCK={updateVSOCK} vm={createVM({ autoattachVSOCK: true })} />);

    await userEvent.click(screen.getByRole('switch'));

    expect(updateVSOCK).toHaveBeenCalledWith(false);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('should allow toggling ON then OFF consecutively', async () => {
    render(<EnableVSOCK updateVSOCK={updateVSOCK} vm={createVM()} />);
    const toggle = screen.getByRole('switch');

    await userEvent.click(toggle);
    expect(updateVSOCK).toHaveBeenLastCalledWith(true);

    await userEvent.click(toggle);
    expect(updateVSOCK).toHaveBeenLastCalledWith(false);

    expect(updateVSOCK).toHaveBeenCalledTimes(2);
  });
});

describe('EnableVSOCK — when feature gate is not enabled', () => {
  const updateVSOCK = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    resetVSOCKMocks();
    updateVSOCK.mockClear();
  });

  it('should disable the toggle when the feature gate is OFF', () => {
    mockFeatureEnabled.mockReturnValue({ featureEnabled: false, isLoading: false });

    render(<EnableVSOCK updateVSOCK={updateVSOCK} vm={createVM()} />);

    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('should not allow interaction when the toggle is disabled', async () => {
    mockFeatureEnabled.mockReturnValue({ featureEnabled: false, isLoading: false });

    render(<EnableVSOCK updateVSOCK={updateVSOCK} vm={createVM()} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeDisabled();
    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);
    expect(updateVSOCK).not.toHaveBeenCalled();
  });

  it('should show VSOCK as checked but disabled if VM already has it but gate is OFF', () => {
    mockFeatureEnabled.mockReturnValue({ featureEnabled: false, isLoading: false });

    render(<EnableVSOCK updateVSOCK={updateVSOCK} vm={createVM({ autoattachVSOCK: true })} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
    expect(toggle).toBeDisabled();
  });

  it('should keep the toggle enabled while feature gate is still loading', () => {
    mockFeatureEnabled.mockReturnValue({ featureEnabled: false, isLoading: true });

    render(<EnableVSOCK updateVSOCK={updateVSOCK} vm={createVM()} />);

    expect(screen.getByRole('switch')).not.toBeDisabled();
  });

  it('should enable the toggle once the feature gate is ON', () => {
    mockFeatureEnabled.mockReturnValue({ featureEnabled: true, isLoading: false });

    render(<EnableVSOCK updateVSOCK={updateVSOCK} vm={createVM()} />);

    expect(screen.getByRole('switch')).not.toBeDisabled();
  });
});
