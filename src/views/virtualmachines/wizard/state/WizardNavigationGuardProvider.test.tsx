import { useNavigate } from 'react-router';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { act, renderHook } from '@testing-library/react';

import { useVMWizardForm } from '../form/VMWizardFormProvider';
import { useWizardNavigationGuard } from './useWizardNavigationGuard';
import WizardNavigationGuardProvider from './WizardNavigationGuardProvider';

jest.mock('@kubevirt-utils/components/ModalProvider/ModalProvider', () => ({
  useModal: jest.fn(),
}));

jest.mock('../form/VMWizardFormProvider', () => ({
  useVMWizardForm: jest.fn(),
}));

jest.mock('react-router', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../hooks/useWizardBeforeUnload', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseModal = useModal as jest.Mock;
const mockUseVMWizardForm = useVMWizardForm as jest.Mock;
const mockUseNavigate = useNavigate as jest.Mock;

const OFF_WIZARD_PATH = '/k8s/ns/ns/virtualmachines';

type GuardMocks = {
  createModal: jest.Mock;
  navigate: jest.Mock;
};

const installMocks = ({ isDirty = true }: { isDirty?: boolean } = {}): GuardMocks => {
  const createModal = jest.fn();
  const navigate = jest.fn();

  mockUseVMWizardForm.mockReturnValue({ formState: { isDirty } });
  mockUseModal.mockReturnValue({ createModal });
  mockUseNavigate.mockReturnValue(navigate);

  return { createModal, navigate };
};

const renderGuard = () =>
  renderHook(() => useWizardNavigationGuard(), { wrapper: WizardNavigationGuardProvider });

describe('WizardNavigationGuardProvider', () => {
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  beforeEach(() => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    originalPushState.call(window.history, {}, '', '/vm-wizard');
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
  });

  it('should patch pushState and replaceState, then restore them on unmount', () => {
    installMocks();

    const { unmount } = renderGuard();

    expect(window.history.pushState).not.toBe(originalPushState);
    expect(window.history.replaceState).not.toBe(originalReplaceState);

    unmount();

    expect(window.history.pushState).toBe(originalPushState);
    expect(window.history.replaceState).toBe(originalReplaceState);
  });

  it('should not restore History methods when another wrapper owns the slot', () => {
    installMocks();

    const { unmount } = renderGuard();

    const laterPush: History['pushState'] = jest.fn();
    const laterReplace: History['pushState'] = jest.fn();
    window.history.pushState = laterPush;
    window.history.replaceState = laterReplace;

    unmount();

    expect(window.history.pushState).toBe(laterPush);
    expect(window.history.replaceState).toBe(laterReplace);
  });

  it('should block a dirty replaceState away from the wizard', () => {
    const { createModal } = installMocks({ isDirty: true });

    renderGuard();

    act(() => {
      window.history.replaceState({}, '', OFF_WIZARD_PATH);
    });

    expect(createModal).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe('/vm-wizard');
  });

  it('should allow replaceState that stays on a wizard url', () => {
    const { createModal, navigate } = installMocks({ isDirty: true });

    renderGuard();

    act(() => {
      window.history.replaceState({}, '', '/vm-wizard?perspective=admin');
    });

    expect(createModal).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/vm-wizard');
  });

  it('should leave on browser Back without confirmation when the form is clean', () => {
    const { createModal } = installMocks({ isDirty: false });
    const goSpy = jest.spyOn(window.history, 'go');

    renderGuard();

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(createModal).not.toHaveBeenCalled();
    expect(goSpy).toHaveBeenCalledWith(-1);

    goSpy.mockRestore();
  });

  it('should re-arm the sentinel and confirm before leaving on dirty Back', () => {
    const { createModal } = installMocks({ isDirty: true });
    const goSpy = jest.spyOn(window.history, 'go');

    renderGuard();

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(createModal).toHaveBeenCalledTimes(1);
    expect(goSpy).not.toHaveBeenCalled();

    goSpy.mockRestore();
  });

  it('should release the guard and navigate in one call via completeWizardAndNavigate', () => {
    const { createModal, navigate } = installMocks({ isDirty: true });

    const { result } = renderGuard();

    act(() => {
      result.current.completeWizardAndNavigate('/k8s/ns/ns/virtualmachines/my-vm');
    });

    expect(navigate).toHaveBeenCalledWith('/k8s/ns/ns/virtualmachines/my-vm', { replace: true });

    // The guard is released, so History writes are no longer intercepted.
    act(() => {
      window.history.replaceState({}, '', OFF_WIZARD_PATH);
    });

    expect(createModal).not.toHaveBeenCalled();
  });
});
