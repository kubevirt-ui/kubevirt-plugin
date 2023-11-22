import { useHistory } from 'react-router-dom';

export const useQueryParamsMethods = () => {
  const history = useHistory();

  const setAllQueryArguments = (newParams: { [k: string]: string }) => {
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
      history.replace(`${url.pathname}?${params.toString()}${url.hash}`);
    }
  };

  const removeQueryArguments = (...keys: string[]) => {
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
      history.replace(`${url.pathname}?${params.toString()}${url.hash}`);
    }
  };

  const setOrRemoveQueryArgument = (k: string, v?: string) =>
    v ? setAllQueryArguments({ [k]: v }) : removeQueryArguments(k);

  return { removeQueryArguments, setAllQueryArguments, setOrRemoveQueryArgument };
};
