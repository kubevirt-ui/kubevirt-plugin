import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

export type AllowedNamespacesFailure = {
  error: string;
  namespace: string;
};

export type AllowedNamespacesResponse = {
  allowedNamespaces: string[];
  failures?: AllowedNamespacesFailure[];
};

export type AllowedNamespacesRequestResourceAttributes = Pick<
  FleetAccessReviewResourceAttributes,
  'group' | 'resource' | 'subresource' | 'verb'
>;

export type AllowedNamespacesRequest = {
  resourceAttributes: AllowedNamespacesRequestResourceAttributes;
};
