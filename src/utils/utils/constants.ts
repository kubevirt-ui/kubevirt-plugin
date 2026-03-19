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
  [NumberOperator.Equals]: { compareFunction: (a, b) => a === b, sign: '=', text: 'Equals' },
  [NumberOperator.GreaterOrEquals]: {
    compareFunction: (a, b) => a >= b,
    sign: '>=',
    text: 'Greater or equals',
  },
  [NumberOperator.GreaterThan]: {
    compareFunction: (a, b) => a > b,
    sign: '>',
    text: 'Greater than',
  },
  [NumberOperator.LessOrEquals]: {
    compareFunction: (a, b) => a <= b,
    sign: '<=',
    text: 'Less or equals',
  },
  [NumberOperator.LessThan]: {
    compareFunction: (a, b) => a < b,
    sign: '<',
    text: 'Less than',
  },
};

export const CLUSTER_LIST_FILTER_TYPE = 'cluster';
export const PROJECT_LIST_FILTER_TYPE = 'project';

export const ROW_FILTERS_PREFIX = 'rowFilter-';

export const CLUSTER_LIST_FILTER_PARAM = `${ROW_FILTERS_PREFIX}${CLUSTER_LIST_FILTER_TYPE}`;
export const PROJECT_LIST_FILTER_PARAM = `${ROW_FILTERS_PREFIX}${PROJECT_LIST_FILTER_TYPE}`;
