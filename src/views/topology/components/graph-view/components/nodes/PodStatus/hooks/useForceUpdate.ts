import { useCallback, useState } from 'react';

type UseForceUpdate = () => () => void;

export const useForceUpdate: UseForceUpdate = () => {
  const [, setTick] = useState(0);
  const update = useCallback(() => {
    setTick((tick) => tick + 1);
  }, []);
  return update;
};

export default useForceUpdate;
