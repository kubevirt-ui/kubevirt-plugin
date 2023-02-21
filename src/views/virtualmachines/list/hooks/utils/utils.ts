import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

const getValueByPath = (obj: K8sResourceCommon, path: string) => {
  const pathArray = path?.split('.');
  return pathArray?.reduce((acc, field) => acc?.[field], obj);
};

export const columnSorting = <T>(
  data: T[],
  direction: string,
  pagination: { [key: string]: any },
  path: string,
) => {
  const { startIndex, endIndex } = pagination;
  const predicate = (a: T, b: T) => {
    const { first, second } =
      direction === 'asc' ? { first: a, second: b } : { second: a, first: b };
    return getValueByPath(first, path)
      ?.toString()
      ?.localeCompare(getValueByPath(second, path)?.toString(), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
  };
  return data?.sort(predicate)?.slice(startIndex, endIndex);
};
