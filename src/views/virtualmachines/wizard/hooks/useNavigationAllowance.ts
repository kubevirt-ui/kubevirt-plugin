import { type MutableRefObject, useCallback, useRef } from 'react';

type UseNavigationAllowanceResult = {
  allowNextWizardNavigation: () => void;
  consumeWizardNavigationAllowance: () => boolean;
  navigationAllowedRef: MutableRefObject<boolean>;
};

const useNavigationAllowance = (): UseNavigationAllowanceResult => {
  const navigationAllowedRef = useRef(false);

  const allowNextWizardNavigation = useCallback((): void => {
    navigationAllowedRef.current = true;
  }, []);

  const consumeWizardNavigationAllowance = useCallback((): boolean => {
    const was = navigationAllowedRef.current;
    navigationAllowedRef.current = false;
    return was;
  }, []);

  return { allowNextWizardNavigation, consumeWizardNavigationAllowance, navigationAllowedRef };
};

export default useNavigationAllowance;
