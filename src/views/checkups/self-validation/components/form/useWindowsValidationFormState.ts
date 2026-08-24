import { useCallback, useEffect, useState } from 'react';

import { TEST_SUITE_TIER2 } from '../../utils/constants';

type UseWindowsValidationFormStateReturn = {
  isEulaConfirmed: boolean;
  isTier2Selected: boolean;
  setIsEulaConfirmed: (checked: boolean) => void;
  setWindowsServerTesting: (checked: boolean) => void;
  setWinImageDownloadUrl: (url: string) => void;
  windowsServerTesting: boolean;
  winImageDownloadUrl: string;
};

const useWindowsValidationFormState = (
  selectedTestSuites: string[],
): UseWindowsValidationFormStateReturn => {
  const [windowsServerTesting, setWindowsServerTesting] = useState<boolean>(false);
  const [isEulaConfirmed, setIsEulaConfirmed] = useState<boolean>(false);
  const [winImageDownloadUrl, setWinImageDownloadUrl] = useState<string>('');

  const isTier2Selected = selectedTestSuites.includes(TEST_SUITE_TIER2);

  const updateWindowsServerTesting = useCallback((checked: boolean) => {
    setWindowsServerTesting(checked);
    if (!checked) {
      setIsEulaConfirmed(false);
      setWinImageDownloadUrl('');
    }
  }, []);

  useEffect(() => {
    if (!isTier2Selected && windowsServerTesting) {
      updateWindowsServerTesting(false);
    }
  }, [isTier2Selected, windowsServerTesting, updateWindowsServerTesting]);

  return {
    isEulaConfirmed,
    isTier2Selected,
    setIsEulaConfirmed,
    setWindowsServerTesting: updateWindowsServerTesting,
    setWinImageDownloadUrl,
    windowsServerTesting,
    winImageDownloadUrl,
  };
};

export default useWindowsValidationFormState;
