import { useLocation, useNavigate } from 'react-router';

type UseURLParamsOptions = {
  /**
   * When true, URL changes use history.replaceState instead of history.pushState.
   * Use this for filter/view-state changes that should not add browser history entries.
   * Firefox enforces a hard limit of 50 pushState calls per 10 seconds and throws
   * SecurityError when exceeded; replaceState has no such limit.
   */
  replace?: boolean;
};

/**
 * A Hook for manipulating URL Parameters and History.
 * @param options
 */
export const useURLParams = (
  options?: UseURLParamsOptions,
): {
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
  const navigateOptions = { replace: options?.replace ?? false };

  /**
   * A function for setting a URL parameter. if the parameter exists, it will be overwritten.
   * @param {string} key - the parameter key
   * @param {string} value - the parameter value
   */
  const setParam = (key: string, value: string) => {
    if (value) {
      params.set(key, value);
      navigate({ pathname: location.pathname, search: params.toString() }, navigateOptions);
    } else {
      if (params.has(key)) {
        params.delete(key);
        navigate({ pathname: location.pathname, search: params.toString() }, navigateOptions);
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
    navigate({ pathname: location.pathname, search: params.toString() }, navigateOptions);
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
      navigate({ pathname: location.pathname, search: params.toString() }, navigateOptions);
    } else {
      if (params.has(key)) {
        params.delete(key);
        navigate({ pathname: location.pathname, search: params.toString() }, navigateOptions);
      }
    }
  };

  return { appendParam, deleteParam, params, setParam };
};
