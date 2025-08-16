import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import useQuery from '@kubevirt-utils/hooks/useQuery';

const BACKEND_FILTER_PARAMS = [
  'labels',
  'name',
  'rowFilter-instanceType',
  'rowFilter-live-migratable',
  'rowFilter-os',
  'rowFilter-status',
  'rowFilter-template',
  'ip',
  'rowFilter-node',
];

const useIsLoading = (loaded: boolean) => {
  const params = useQuery();
  const { ns: currentNamespace } = useParams<{ ns?: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const previousNamespaceRef = useRef<string | undefined>(currentNamespace);
  const previousParamsRef = useRef<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    const previousParams = previousParamsRef.current;

    const namespaceChanged = currentNamespace !== previousNamespaceRef.current;
    const paramsChanged = params.toString() !== previousParams.toString();

    if (namespaceChanged) {
      setIsLoading(true);
    } else if (paramsChanged) {
      const isFrontendFilterEnough = Array.from(previousParams.keys()).length === 0;

      if (!isFrontendFilterEnough) {
        const backendFilterChanged = BACKEND_FILTER_PARAMS.some(
          (param) => params.get(param) !== previousParams.get(param),
        );

        if (backendFilterChanged) {
          setIsLoading(true);
        }
      }
    }

    previousNamespaceRef.current = currentNamespace;
    previousParamsRef.current = new URLSearchParams(params);
  }, [params, currentNamespace]);

  useEffect(() => {
    if (loaded) {
      setIsLoading(false);
    }
  }, [loaded]);

  return isLoading;
};

export default useIsLoading;
