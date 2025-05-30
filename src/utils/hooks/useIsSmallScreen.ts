import { useEffect, useState } from 'react';

import { BREAKPOINTS } from '@kubevirt-utils/constants/window';

const useIsSmallScreen = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < BREAKPOINTS.md);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < BREAKPOINTS.md);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isSmallScreen;
};

export default useIsSmallScreen;
