import { useEffect, useMemo, useRef } from 'react';
import { type SetURLSearchParams, useSearchParams } from 'react-router';

import { migrateLegacyFilterParams } from '../utils';

type UseMigratedSearchParams = () => [URLSearchParams, SetURLSearchParams];

const useMigratedSearchParams: UseMigratedSearchParams = () => {
  const [rawSearchParams, setSearchParams] = useSearchParams();

  const migratedParams = useMemo(
    () => migrateLegacyFilterParams(rawSearchParams),
    [rawSearchParams],
  );
  const searchParams = migratedParams ?? rawSearchParams;

  const migrationDoneRef = useRef(false);
  useEffect(() => {
    if (migratedParams && !migrationDoneRef.current) {
      migrationDoneRef.current = true;
      setSearchParams(migratedParams, { replace: true });
    }
  }, [migratedParams, setSearchParams]);

  return [searchParams, setSearchParams];
};

export default useMigratedSearchParams;
