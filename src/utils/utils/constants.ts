import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const MAX_K8S_NAME_LENGTH = 63;

export const POPPER_CONTAINER_ID = 'popper-container';

export enum NumberOperator {
  Equals = 'Equals',
  GreaterOrEquals = 'GreaterOrEquals',
  GreaterThan = 'GreaterThan',
  LessOrEquals = 'LessOrEquals',
  LessThan = 'LessThan',
}

export const numberOperatorInfo: Record<
  NumberOperator,
  { compareFunction: (a: number, b: number) => boolean; sign: string; text: string }
> = {
  [NumberOperator.Equals]: { compareFunction: (a, b) => a === b, sign: '=', text: t('Equals') },
  [NumberOperator.GreaterOrEquals]: {
    compareFunction: (a, b) => a >= b,
    sign: '>=',
    text: t('Greater or equals'),
  },
  [NumberOperator.GreaterThan]: {
    compareFunction: (a, b) => a > b,
    sign: '>',
    text: t('Greater than'),
  },
  [NumberOperator.LessOrEquals]: {
    compareFunction: (a, b) => a <= b,
    sign: '<=',
    text: t('Less or equals'),
  },
  [NumberOperator.LessThan]: {
    compareFunction: (a, b) => a < b,
    sign: '<',
    text: t('Less than'),
  },
};
