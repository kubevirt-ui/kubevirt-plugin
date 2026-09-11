import { useCallback } from 'react';

import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';

import { IS_LIST_PARAM, NAMESPACE_PARAM } from '../utils/consts';

type UseCatalogUIState = () => {
  isList: boolean;
  namespace: string;
  setIsList: (value: boolean) => void;
  setNamespace: (value: string) => void;
};

const useCatalogUIState: UseCatalogUIState = () => {
  const { params, setParam } = useURLParams();

  const namespace = params.get(NAMESPACE_PARAM) ?? '';
  const isList = params.get(IS_LIST_PARAM) === 'true';

  const setNamespace = useCallback((value: string) => setParam(NAMESPACE_PARAM, value), [setParam]);

  const setIsList = useCallback(
    (value: boolean) => setParam(IS_LIST_PARAM, String(value)),
    [setParam],
  );

  return { isList, namespace, setIsList, setNamespace };
};

export default useCatalogUIState;
