export const buildFilterPath = (
  basePath: string,
  paramName: string,
  paramValue: string,
): string => {
  const [pathWithoutHash, hash = ''] = basePath.split('#', 2);
  const [pathname, search = ''] = pathWithoutHash.split('?', 2);
  const params = new URLSearchParams(search);
  params.set(paramName, paramValue);
  return `${pathname}?${params.toString()}${hash ? `#${hash}` : ''}`;
};
