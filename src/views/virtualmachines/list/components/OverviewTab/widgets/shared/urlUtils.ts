const withParams = (basePath: string, mutate: (params: URLSearchParams) => void): string => {
  const [pathWithoutHash, hash = ''] = basePath.split('#', 2);
  const [pathname, search = ''] = pathWithoutHash.split('?', 2);
  const params = new URLSearchParams(search);
  mutate(params);
  const hashSuffix = hash ? `#${hash}` : '';
  return `${pathname}?${params.toString()}${hashSuffix}`;
};

// Repeated-key convention, used by kubevirt-plugin's own filters
export const buildFilterPath = (
  basePath: string,
  paramName: string,
  paramValues: string[],
): string =>
  withParams(basePath, (params) => {
    for (const value of paramValues) params.append(paramName, value);
  });

// JSON-array-in-one-param convention, used by MTV's forklift-console-plugin pages
export const buildJsonArrayFilterPath = (
  basePath: string,
  paramName: string,
  paramValues: string[],
): string => withParams(basePath, (params) => params.set(paramName, JSON.stringify(paramValues)));
