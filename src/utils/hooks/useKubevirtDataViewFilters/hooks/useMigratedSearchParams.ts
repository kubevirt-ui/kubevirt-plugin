import { useEffect, useMemo, useRef } from 'react';
import { SetURLSearchParams, useSearchParams } from 'react-router';

import { migrateLegacyFilterParams } from '../utils';

type UseMigratedSearchParams = () => [URLSearchParams, SetURLSearchParams];

const useMigratedSearchParams: UseMigratedSearchParams = () => {
  const [rawSearchParams, setSearchParams] = useSearchParams();

  const migratedParams = useMemo(
    () => migrateLegacyFilterParams(rawSearchParams),
    [rawSearchParams],
  );
  const searchParams = migratedParams ?? rawSearchParams;

  const migrationDone = useRef(false);
  useEffect(() => {
    if (migratedParams && !migrationDone.current) {
      migrationDone.current = true;
      setSearchParams(migratedParams, { replace: true });
    }
  }, [migratedParams, setSearchParams]);

  return [searchParams, setSearchParams];
};

export default useMigratedSearchParams;
