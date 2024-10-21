import { Action } from '@openshift-console/dynamic-plugin-sdk';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type ActionDropdownItemType = Optional<Action, 'cta'> & { options?: Action[] };
