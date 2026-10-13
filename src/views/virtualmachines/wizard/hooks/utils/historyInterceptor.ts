type HistoryStateMethod = History['pushState'];
type HistoryStateMethodName = 'pushState' | 'replaceState';

export const getIntendedPathFromHistoryUrl = (rawUrl: unknown): string => {
  const value = String(rawUrl ?? '');
  if (!value) {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  try {
    const parsedUrl = new URL(value, window.location.href);
    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return value;
  }
};

export const createHistoryStateInterceptor = (
  original: HistoryStateMethod,
  shouldAllow: (intendedPath: string) => boolean,
  onBlock: (intendedPath: string) => void,
): HistoryStateMethod => {
  return (...args: Parameters<HistoryStateMethod>): void => {
    const intendedPath = getIntendedPathFromHistoryUrl(args[2]);
    if (shouldAllow(intendedPath)) {
      original.call(window.history, args[0], args[1], args[2]);
      return;
    }
    onBlock(intendedPath);
  };
};

export const restoreHistoryMethodIfOwned = (
  method: HistoryStateMethodName,
  intercept: HistoryStateMethod,
  original: HistoryStateMethod,
): void => {
  if (window.history[method] === intercept) {
    window.history[method] = original;
  }
};
