import { QueryParams } from '@openshift-console/dynamic-plugin-sdk';
import { EventKind } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';

export enum EventType {
  Added = 'ADDED',
  Deleted = 'Deleted',
  Modified = 'MODIFIED',
}

export type EventMessage = {
  object: EventKind;
  type: EventType;
};

export type ResourceOptions = {
  name?: string;
  ns?: string;
  path?: string;
  queryParams?: QueryParams;
};
