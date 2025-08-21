import { Action } from '@openshift-console/dynamic-plugin-sdk';

export type ActionDropdownItemType = Action & { options?: Action[] };
