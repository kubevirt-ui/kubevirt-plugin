import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';

export const getOperatorChipLabel = (value: string): string => {
  const [operator, ...rest] = value.split(' ');
  return `${numberOperatorInfo[operator]?.sign ?? operator} ${rest.join(' ')}`;
};
