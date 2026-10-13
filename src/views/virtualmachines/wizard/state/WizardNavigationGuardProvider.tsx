import {
  type FC,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { isVMWizardURL } from '@multicluster/urls';

import ExitWizardModal from '../components/ExitWizardModal';
import { useVMWizardForm } from '../form/VMWizardFormProvider';
import useWizardBeforeUnload from '../hooks/useWizardBeforeUnload';
import {
  createHistoryStateInterceptor,
  restoreHistoryMethodIfOwned,
} from '../hooks/utils/historyInterceptor';
import {
  WizardNavigationGuardContext,
  type WizardNavigationGuardContextValue,
} from './useWizardNavigationGuard';

/**
 * Guards unsaved wizard changes (`isDirty`) without `useBlocker` (unsupported by `<BrowserRouter>`).
 * - Intercepts external `pushState`/`replaceState` calls to show an exit modal.
 * - Traps back/forward (POP) with a same-URL sentinel (`history.go(-2)` on confirmed exit).
 * - Leaves safely via `completeWizardAndNavigate`, which releases the guard before navigating.
 */

const WizardNavigationGuardProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    formState: { isDirty },
  } = useVMWizardForm();
  const { createModal } = useModal();
  const navigate = useNavigate();

  const isBlockedRef = useRef(true);
  const [isBlocked, setIsBlocked] = useState(true);

  const isDirtyRef = useRef(isDirty);
  const createModalRef = useRef(createModal);
  const navigateRef = useRef(navigate);
  const isPendingRef = useRef(false);

  useWizardBeforeUnload(isBlocked && isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);
  useEffect(() => {
    createModalRef.current = createModal;
  }, [createModal]);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const releaseNavigation = useCallback((): void => {
    isBlockedRef.current = false;
    setIsBlocked(false);
  }, []);

  const blockWizardNavigation = useCallback((): void => {
    isBlockedRef.current = true;
    setIsBlocked(true);
  }, []);

  const completeWizardAndNavigate = useCallback(
    (destinationUrl: string): void => {
      releaseNavigation();
      navigateRef.current(destinationUrl, { replace: true });
    },
    [releaseNavigation],
  );

  const openExitModal = useCallback(
    (onConfirm: () => void): void => {
      createModalRef.current?.(({ isOpen, onClose }) => {
        const handleClose = (): void => {
          isPendingRef.current = false;
          onClose();
        };
        const handleExit = (): void => {
          isPendingRef.current = false;
          releaseNavigation();
          onClose();
          onConfirm();
        };
        return <ExitWizardModal isOpen={isOpen} onClose={handleClose} onExit={handleExit} />;
      });
    },
    [releaseNavigation],
  );

  useEffect((): (() => void) | void => {
    if (!isBlocked) return;

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const shouldAllowHistoryWrite = (intendedPath: string): boolean => {
      // Wizard-internal writes never consume the navigation release.
      if (isVMWizardURL(intendedPath)) return true;
      if (!isBlockedRef.current) return true;
      return !isDirtyRef.current;
    };

    const blockHistoryWrite = (intendedPath: string, replace: boolean): void => {
      if (isPendingRef.current) return;
      isPendingRef.current = true;
      openExitModal(() => navigateRef.current(intendedPath, { replace }));
    };

    const interceptPushState = createHistoryStateInterceptor(
      originalPushState,
      shouldAllowHistoryWrite,
      (intendedPath) => blockHistoryWrite(intendedPath, false),
    );
    const interceptReplaceState = createHistoryStateInterceptor(
      originalReplaceState,
      shouldAllowHistoryWrite,
      (intendedPath) => blockHistoryWrite(intendedPath, true),
    );

    window.history.pushState = interceptPushState;
    window.history.replaceState = interceptReplaceState;

    const pushSentinel = (): void => {
      originalPushState.call(window.history, window.history.state, '', window.location.href);
    };

    pushSentinel();

    const handlePopstate = (): void => {
      if (!isBlockedRef.current) return;

      if (!isDirtyRef.current) {
        // Sentinel is already popped; one step back leaves the wizard.
        releaseNavigation();
        window.history.go(-1);
        return;
      }

      pushSentinel();

      if (isPendingRef.current) return;
      isPendingRef.current = true;

      openExitModal(() => window.history.go(-2));
    };

    window.addEventListener('popstate', handlePopstate);

    return (): void => {
      restoreHistoryMethodIfOwned('pushState', interceptPushState, originalPushState);
      restoreHistoryMethodIfOwned('replaceState', interceptReplaceState, originalReplaceState);
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [isBlocked, openExitModal, releaseNavigation]);

  const value = useMemo<WizardNavigationGuardContextValue>(
    () => ({ blockWizardNavigation, completeWizardAndNavigate }),
    [blockWizardNavigation, completeWizardAndNavigate],
  );

  return (
    <WizardNavigationGuardContext.Provider value={value}>
      {children}
    </WizardNavigationGuardContext.Provider>
  );
};

export default WizardNavigationGuardProvider;
