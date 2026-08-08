import { useCallback, useEffect, useState } from 'react';

import { TEST_SUITE_TIER2 } from '../../utils/constants';

type UseWindowsValidationFormStateReturn = {
  isEulaConfirmed: boolean;
  isTier2Selected: boolean;
  setIsEulaConfirmed: (checked: boolean) => void;
  setWinImageDownloadUrl: (url: string) => void;
  setWindowsServerTesting: (checked: boolean) => void;
  winImageDownloadUrl: string;
  windowsServerTesting: boolean;
};

const useWindowsValidationFormState = (
  selectedTestSuites: string[],
): UseWindowsValidationFormStateReturn => {
  const [windowsServerTesting, setWindowsServerTestingState] = useState<boolean>(false);
  const [isEulaConfirmed, setIsEulaConfirmed] = useState<boolean>(false);
  const [winImageDownloadUrl, setWinImageDownloadUrl] = useState<string>('');

  const isTier2Selected = selectedTestSuites.includes(TEST_SUITE_TIER2);

  const setWindowsServerTesting = useCallback((checked: boolean) => {
    setWindowsServerTestingState(checked);
    if (!checked) {
      setIsEulaConfirmed(false);
      setWinImageDownloadUrl('');
    }
  }, []);

  useEffect(() => {
    if (!isTier2Selected && windowsServerTesting) {
      setWindowsServerTesting(false);
    }
  }, [isTier2Selected, windowsServerTesting, setWindowsServerTesting]);

  return {
    isEulaConfirmed,
    isTier2Selected,
    setIsEulaConfirmed,
    setWinImageDownloadUrl,
    setWindowsServerTesting,
    winImageDownloadUrl,
    windowsServerTesting,
  };
};

export default useWindowsValidationFormState;
