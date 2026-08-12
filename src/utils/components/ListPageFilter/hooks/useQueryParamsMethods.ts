import { useCallback } from 'react';
import { useNavigate } from 'react-router';

export const useQueryParamsMethods = (): {
  removeQueryArguments: (...keys: string[]) => void;
  removeQueryArgumentValues: (key: string, valuesToRemove: string[]) => void;
  setAllQueryArguments: (newParams: { [key: string]: string }) => void;
  setOrRemoveQueryArgument: (key: string, value?: string) => void;
} => {
  const navigate = useNavigate();

  const setAllQueryArguments = useCallback(
    (newParams: { [key: string]: string }) => {
      const params = new URLSearchParams(window.location.search);
      let update = false;

      for (const [key, value] of Object.entries(newParams || {})) {
        if (params.get(key) !== value) {
          update = true;
          params.set(key, value);
        }
      }

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
      for (const key of keys) {
        if (params.has(key)) {
          update = true;
          params.delete(key);
        }
      }
      if (update) {
        const url = new URL(window.location.href);
        navigate(`${url.pathname}?${params.toString()}${url.hash}`, { replace: true });
      }
    },
    [navigate],
  );

  const removeQueryArgumentValues = useCallback(
    (key: string, valuesToRemove: string[]) => {
      const params = new URLSearchParams(window.location.search);
      if (!params.has(key)) return;

      const hadValues = valuesToRemove.some((val) => params.has(key, val));
      if (!hadValues) return;

      for (const val of valuesToRemove) params.delete(key, val);

      const url = new URL(window.location.href);
      navigate(`${url.pathname}?${params.toString()}${url.hash}`, { replace: true });
    },
    [navigate],
  );

  const setOrRemoveQueryArgument = useCallback(
    (key: string, value?: string) =>
      value ? setAllQueryArguments({ [key]: value }) : removeQueryArguments(key),
    [setAllQueryArguments, removeQueryArguments],
  );

  return {
    removeQueryArguments,
    removeQueryArgumentValues,
    setAllQueryArguments,
    setOrRemoveQueryArgument,
  };
};
