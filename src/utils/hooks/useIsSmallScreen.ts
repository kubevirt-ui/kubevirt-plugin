import { useEffect, useState } from 'react';

import { BREAKPOINTS } from '@kubevirt-utils/constants/window';

const useIsSmallScreen = (): boolean => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < BREAKPOINTS.md);

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmallScreen(window.innerWidth < BREAKPOINTS.md);
    };

    window.addEventListener('resize', handleResize);
    return (): void => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isSmallScreen;
};

export default useIsSmallScreen;
