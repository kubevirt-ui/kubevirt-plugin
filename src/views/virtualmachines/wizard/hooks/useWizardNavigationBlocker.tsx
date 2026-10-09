import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { isVMWizardURL } from '@multicluster/urls';

import ExitWizardModal from '../components/ExitWizardModal';
import { useVMWizardState } from '../state/useVMWizardState';

/**
 * Intercepts navigation away from the wizard and presents a confirmation modal.
 *
 * - PUSH (links, navigate()): Overrides `window.history.pushState` to trap routing.
 * - POP (browser back/forward): Pushes a same-URL sentinel entry on mount to trap
 *   back navigation, exiting via `history.go(-2)` upon confirmation.
 * - Programmatic exits bypass interception via the navigation allowance flag.
 */
const useWizardNavigationBlocker = (): void => {
  const { allowNextWizardNavigation, consumeWizardNavigationAllowance, isCompleted } =
    useVMWizardState();
  const { createModal } = useModal();
  const navigate = useNavigate();

  const isCompletedRef = useRef(isCompleted);
  const createModalRef = useRef(createModal);
  const navigateRef = useRef(navigate);

  // Prevents stacking multiple modals if rapid navigation events arrive.
  const isPendingRef = useRef(false);

  // The unpatched pushState, used to manage sentinel entries without re-triggering
  // our own interceptor.
  const originalPushStateRef = useRef<typeof window.history.pushState | null>(null);

  // Sync refs after each render without mutating them during render.
  useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);
  useEffect(() => {
    createModalRef.current = createModal;
  }, [createModal]);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const openExitModal = useCallback(
    (onConfirm: () => void): void => {
      createModalRef.current?.(({ isOpen, onClose }) => {
        const handleClose = (): void => {
          isPendingRef.current = false;
          onClose();
        };
        const handleExit = (): void => {
          isPendingRef.current = false;
          allowNextWizardNavigation();
          onClose();
          onConfirm();
        };
        return <ExitWizardModal isOpen={isOpen} onClose={handleClose} onExit={handleExit} />;
      });
    },
    [allowNextWizardNavigation],
  );

  // Intercept pushState (sidebar links, navigate(), Cancel)
  useEffect((): (() => void) | void => {
    if (isCompleted) return;

    const original = window.history.pushState.bind(window.history);
    originalPushStateRef.current = original;

    const interceptPushState = (...args: Parameters<typeof window.history.pushState>): void => {
      // Let through if navigation was explicitly allowed (confirmed exit or post-creation).
      if (consumeWizardNavigationAllowance() || isCompletedRef.current) {
        original(...args);
        return;
      }

      // Extract the intended destination path from pushState args.
      const rawUrl = String(args[2] ?? '');
      let intendedPath = rawUrl;
      try {
        if (rawUrl.startsWith('http')) {
          const parsedUrl = new URL(rawUrl);
          intendedPath = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
        }
      } catch {
        /* keep rawUrl */
      }

      // Wizard-internal navigation (e.g. step changes): let it through unchanged.
      if (isVMWizardURL(intendedPath)) {
        original(...args);
        return;
      }

      if (isPendingRef.current) return;
      isPendingRef.current = true;

      openExitModal(() => navigateRef.current(intendedPath));
    };

    window.history.pushState = interceptPushState;

    return (): void => {
      window.history.pushState = original;
      originalPushStateRef.current = null;
    };
  }, [consumeWizardNavigationAllowance, isCompleted, openExitModal]);

  // Intercept popstate (browser back/forward) via the same-URL sentinel trap.
  useEffect((): (() => void) | void => {
    if (isCompleted) return;

    // Duplicate current entry to prevent unmounting wizard on POP
    const pushSentinel = (): void =>
      originalPushStateRef.current?.(window.history.state, '', window.location.href);

    pushSentinel();

    const handlePopstate = (): void => {
      // Allow confirmed programmatic exit (go(-2))
      if (consumeWizardNavigationAllowance() || isCompletedRef.current) return;

      // Re-arm sentinel for repeated Back actions
      pushSentinel();

      if (isPendingRef.current) return;
      isPendingRef.current = true;

      // Step back past sentinel and wizard entry on exit
      openExitModal(() => window.history.go(-2));
    };

    window.addEventListener('popstate', handlePopstate);
    return (): void => window.removeEventListener('popstate', handlePopstate);
  }, [consumeWizardNavigationAllowance, isCompleted, openExitModal]);
};

export default useWizardNavigationBlocker;
