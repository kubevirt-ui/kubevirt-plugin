import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

const getValueByPath = (obj: V1VirtualMachine, path: string) => {
  const pathArray = path.split('.');
  return pathArray.reduce((acc, field) => acc?.[field], obj);
};

export const columnSorting = (
  data: V1VirtualMachine[],
  direction: string,
  pagination: { [key: string]: any },
  path: string,
) => {
  const { startIndex, endIndex } = pagination;
  const predicate = (a: V1VirtualMachine, b: V1VirtualMachine) => {
    const { first, second } =
      direction === 'asc' ? { first: a, second: b } : { second: a, first: b };
    return getValueByPath(first, path)?.localeCompare(getValueByPath(second, path), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  };
  return data?.sort(predicate)?.slice(startIndex, endIndex);
};
