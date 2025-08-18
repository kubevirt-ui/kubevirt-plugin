import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

export const useQueryParamsMethods = () => {
  const navigate = useNavigate();

  const setAllQueryArguments = useCallback(
    (newParams: { [k: string]: string }) => {
      const params = new URLSearchParams(window.location.search);
      let update = false;

      Object.entries(newParams || {}).forEach(([k, v]) => {
        if (params.get(k) !== v) {
          update = true;
          params.set(k, v);
        }
      });

      if (update) {
        const url = new URL(window.location.href);
        navigate(`${url.pathname}?${params.toString()}${url.hash}`, { replace: true });
      }
    },
    [navigate],
  );

  const removeQueryArguments = useCallback(
    (...keys: string[]) => {
      const params = new URLSearchParams(window.location.search);
      let update = false;
      keys.forEach((k) => {
        if (params.has(k)) {
          update = true;
          params.delete(k);
        }
      });
      if (update) {
        const url = new URL(window.location.href);
        navigate(`${url.pathname}?${params.toString()}${url.hash}`, { replace: true });
      }
    },
    [navigate],
  );

  const setOrRemoveQueryArgument = useCallback(
    (k: string, v?: string) => (v ? setAllQueryArguments({ [k]: v }) : removeQueryArguments(k)),
    [setAllQueryArguments, removeQueryArguments],
  );

  return { removeQueryArguments, setAllQueryArguments, setOrRemoveQueryArgument };
};
