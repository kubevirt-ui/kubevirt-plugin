import { useState } from 'react';

import useOutdatedVirtioDrivers from './useOutdatedVirtioDrivers';

type UseVirtIODriversAlert = () => {
  setSessionDismissed: (dismissed: boolean) => void;
  showAlert: boolean;
  showBackupAlert: boolean;
  vmsCount: number;
};

const useVirtIODriversAlert: UseVirtIODriversAlert = () => {
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const { isCountUnavailable, loaded, vmsCount } = useOutdatedVirtioDrivers();

  const showAlert = loaded && !sessionDismissed && vmsCount > 0;
  const showBackupAlert = loaded && !sessionDismissed && isCountUnavailable;

  return {
    setSessionDismissed,
    showAlert,
    showBackupAlert,
    vmsCount,
  };
};

export default useVirtIODriversAlert;
