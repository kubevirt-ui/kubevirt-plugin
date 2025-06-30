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

export const addResizeListener = (callback) => {
  const resizeListener = debounce(callback, 100);
  window.addEventListener('resize', resizeListener);
  return resizeListener;
};

export const removeResizeListenerIfExists = (callback) => {
  if (!callback) {
    return;
  }
  window.removeEventListener('resize', callback);
};
