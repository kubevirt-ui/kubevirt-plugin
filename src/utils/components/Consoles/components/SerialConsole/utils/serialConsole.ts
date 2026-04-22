import { debounce } from 'lodash';

// utility from https://github.com/openshift/console/blob/b77f40a19e14735b257f80f00290ba49994308ca/frontend/packages/console-dynamic-plugin-sdk/src/utils/k8s/ws-factory.ts#L2
export const createURL = (host: string, path: string): string => {
  let url;

  if (host === 'auto') {
    if (window.location.protocol === 'https:') {
      url = 'wss://';
    } else {
      url = 'ws://';
    }
    url += window.location.host;
  } else {
    url = host;
  }

  if (path) {
    url += path;
  }

  return url;
};

export const addResizeObserver = (element: HTMLElement, callback: () => void): ResizeObserver => {
  const debouncedCallback = debounce(callback, 100);
  const observer = new ResizeObserver(debouncedCallback);
  observer.observe(element);
  return observer;
};

export const removeResizeObserver = (observer: null | ResizeObserver): void => {
  observer?.disconnect();
};
