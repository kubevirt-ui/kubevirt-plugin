import { useEffect, useRef, useState } from 'react';

import {
  dismissOnboardingPopoverByWelcomeModalSignal,
  runningTourSignal,
} from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { QuickStartUserSettings } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/userSettingsInitialState';
import { useSignals } from '@preact/signals-react/runtime';

type UseWelcomeModalReturn = {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgainCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  quickStarts: QuickStartUserSettings | undefined;
};

const useWelcomeModal = (): UseWelcomeModalReturn => {
  useSignals();
  const [quickStarts, setQuickStarts, loaded] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.quickStart,
  );
  const [isOpen, setIsOpen] = useState(false);
  const isModalOpenedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!loaded || isModalOpenedRef.current) {
      return;
    }

    const shouldOpenModal = !runningTourSignal.value && !quickStarts?.dontShowWelcomeModal;

    isModalOpenedRef.current = shouldOpenModal;
    dismissOnboardingPopoverByWelcomeModalSignal.value = shouldOpenModal;
    setIsOpen(shouldOpenModal);
  }, [loaded, quickStarts?.dontShowWelcomeModal]);

  const onClose = () => {
    setIsOpen(false);
    dismissOnboardingPopoverByWelcomeModalSignal.value = Boolean(quickStarts?.dontShowWelcomeModal);
  };

  const onDontShowAgainCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuickStarts({
      ...quickStarts,
      dontShowWelcomeModal: event.target.checked,
    });
  };

  return {
    isOpen,
    onClose,
    onDontShowAgainCheckboxChange,
    quickStarts,
  };
};

export default useWelcomeModal;
