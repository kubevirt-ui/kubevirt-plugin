import { useHistory, useLocation } from 'react-router-dom';

export const useURLParams = (): {
  params: URLSearchParams;
  setParam: (key: string, value: string) => void;
  appendParam: (key: string, value: string) => void;
  deleteParam: (key: string, value?: string) => void;
} => {
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);

  const setParam = (key: string, value: string) => {
    if (value) {
      params.set(key, value);
      history.replace({ pathname: location.pathname, search: params.toString() });
    } else {
      if (params.has(key)) {
        params.delete(key);
        history.replace({ pathname: location.pathname, search: params.toString() });
      }
    }
  };

  const appendParam = (key: string, value: string) => {
    params.append(key, value);
    history.replace({ pathname: location.pathname, search: params.toString() });
  };

  const deleteParam = (key: string, value?: string) => {
    if (value) {
      const newParams = [...params.getAll(key)].filter((v) => v !== value);
      params.delete(key);
      newParams.forEach((v) => params.append(key, v));
      history.replace({ pathname: location.pathname, search: params.toString() });
    } else {
      if (params.has(key)) {
        params.delete(key);
        history.replace({ pathname: location.pathname, search: params.toString() });
      }
    }
  };

  return { params, setParam, appendParam, deleteParam };
};
