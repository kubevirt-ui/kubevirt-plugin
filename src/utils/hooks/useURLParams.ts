import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

/**
 * A Hook for manipulating URL Parameters and History.
 */
export const useURLParams = (): {
  /** A function for appending a URL parameter. if the parameter exists, it will not be overwritten. */
  appendParam: (key: string, value: string) => void;
  /** A function for deleting a URL parameter. */
  deleteParam: (key: string, value?: string) => void;
  params: URLSearchParams;
  /** A function for setting a URL parameter. if the parameter exists, it will be overwritten. */
  setParam: (key: string, value: string) => void;
} => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  /**
   * A function for setting a URL parameter. if the parameter exists, it will be overwritten.
   * @param {string} key - the parameter key
   * @param {string} value - the parameter value
   */
  const setParam = (key: string, value: string) => {
    if (value) {
      params.set(key, value);
      navigate({ pathname: location.pathname, search: params.toString() });
    } else {
      if (params.has(key)) {
        params.delete(key);
        navigate({ pathname: location.pathname, search: params.toString() });
      }
    }
  };

  /**
   * A function for appending a URL parameter. if the parameter exists, it will not be overwritten.
   * @param {string} key - the parameter key
   * @param {string} value - the parameter value
   */
  const appendParam = (key: string, value: string) => {
    params.append(key, value);
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  /**
   * A function for deleting a URL parameter.
   * @param {string} key - the parameter key
   * @param {string} value - the parameter value
   */
  const deleteParam = (key: string, value?: string) => {
    if (value) {
      const newParams = [...params.getAll(key)].filter((v) => v !== value);
      params.delete(key);
      newParams.forEach((v) => params.append(key, v));
      navigate({ pathname: location.pathname, search: params.toString() });
    } else {
      if (params.has(key)) {
        params.delete(key);
        navigate({ pathname: location.pathname, search: params.toString() });
      }
    }
  };

  return { appendParam, deleteParam, params, setParam };
};
