import { useHistory, useLocation } from 'react-router-dom';

/**
 * A Hook for manipulating URL Parameters and History.
 */
export const useURLParams = (): {
  params: URLSearchParams;
  /** A function for setting a URL parameter. if the parameter exists, it will be overwritten. */
  setParam: (key: string, value: string) => void;
  /** A function for appending a URL parameter. if the parameter exists, it will not be overwritten. */
  appendParam: (key: string, value: string) => void;
  /** A function for deleting a URL parameter. */
  deleteParam: (key: string, value?: string) => void;
} => {
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);

  /**
   * A function for setting a URL parameter. if the parameter exists, it will be overwritten.
   * @param {string} key - the parameter key
   * @param {string} value - the parameter value
   */
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

  /**
   * A function for appending a URL parameter. if the parameter exists, it will not be overwritten.
   * @param {string} key - the parameter key
   * @param {string} value - the parameter value
   */
  const appendParam = (key: string, value: string) => {
    params.append(key, value);
    history.replace({ pathname: location.pathname, search: params.toString() });
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
