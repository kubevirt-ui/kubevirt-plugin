import { useEffect, useMemo, useState } from 'react';

import { ColumnConfig } from '../useDataViewTableSort/types';

import { BREAKPOINT_XXL, isColumnVisible } from './constants';

export const useResponsiveColumns = <TData, TCallbacks = undefined>(
  columns: ColumnConfig<TData, TCallbacks>[],
): ColumnConfig<TData, TCallbacks>[] => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : BREAKPOINT_XXL,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setWindowWidth(window.innerWidth), 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return useMemo(
    () => columns.filter((col, index) => isColumnVisible(windowWidth, index, col.key)),
    [columns, windowWidth],
  );
};
