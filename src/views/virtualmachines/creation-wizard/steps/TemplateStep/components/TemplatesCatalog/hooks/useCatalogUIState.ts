import { useCallback } from 'react';

import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';

const NAMESPACE_PARAM = 'namespace';
const IS_LIST_PARAM = 'isList';

const useCatalogUIState = () => {
  const { params, setParam } = useURLParams();

  const namespace = params.get(NAMESPACE_PARAM) || '';
  const isList = params.get(IS_LIST_PARAM) === 'true';

  const setNamespace = useCallback((value: string) => setParam(NAMESPACE_PARAM, value), [setParam]);

  const setIsList = useCallback(
    (value: boolean) => setParam(IS_LIST_PARAM, String(value)),
    [setParam],
  );

  return { isList, namespace, setIsList, setNamespace };
};

export default useCatalogUIState;
