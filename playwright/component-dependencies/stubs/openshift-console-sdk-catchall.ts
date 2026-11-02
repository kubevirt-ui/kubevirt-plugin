/**
 * Default re-export target for unmapped `@openshift-console/dynamic-plugin-sdk` subpaths.
 * Composes hand-written SDK stubs plus generated no-op exports.
 */
import { createElement, type ReactNode } from 'react';

export * from './openshift-console-sdk';
export * from './openshift-console-sdk-generated';
export { k8sBasePath } from './openshift-console-sdk-k8s';

export const ResourceLink = ({
  'data-test': dataTest,
  name,
}: {
  'data-test'?: string;
  name?: string;
}): ReactNode => createElement('span', { 'data-test': dataTest ?? name }, name);

export const Operator = { DoesNotExist: 'DoesNotExist', Exists: 'Exists' };

export const ActionMenuVariant = {
  DEFAULT: 'default',
  DROPDOWN: 'dropdown',
  KEBAB: 'kebab',
  PLAIN: 'plain',
};

export const PrometheusEndpoint = { QUERY: 'query', QUERY_RANGE: 'query_range' };

export const BlueInfoCircleIcon = (): null => null;

export const RedExclamationCircleIcon = (): null => null;

export const GreenCheckCircleIcon = (): null => null;

export const YellowExclamationTriangleIcon = (): null => null;

const Status = ({ children }: { children?: ReactNode }): ReactNode => children ?? null;

export default Status;

/** Access review tuple: `[allowed, loading]` (gallery list/empty states). */
export const useAccessReview = (): [boolean, boolean] => [true, false];

export const SilenceStates = { Active: 'active', Expired: 'expired', Pending: 'pending' };

export const impersonateStateToProps = (): { impersonate: undefined } => ({
  impersonate: undefined,
});

export type ImpersonateKind = { kind: string; name: string };

export type EventKind = Record<string, unknown>;

export type K8sModel = {
  abbr?: string;
  apiVersion?: string;
  kind: string;
  label?: string;
  labelKey?: string;
  plural?: string;
};

export type K8sGroupVersionKind = { group: string; kind: string; version: string };

export type WatchK8sResults = Record<string, unknown>;

export type Alert = Record<string, unknown>;

export type Selector = Record<string, unknown>;

export type ObjectMetadata = Record<string, unknown>;

export type ColoredIconProps = Record<string, unknown>;

export type ResolvedExtension = Record<string, unknown>;

export type TopologyDataObject = Record<string, unknown>;

export type OdcNodeModel = Record<string, unknown>;

export type Extension = Record<string, unknown>;

export type CodeRef = unknown;

export type Action = Record<string, unknown>;

export type ListPageHeaderProps = Record<string, unknown>;

export const ListPageCreate = ({
  children,
  ...props
}: {
  children?: ReactNode;
  groupVersionKind?: unknown;
}): ReactNode =>
  createElement('a', { href: '/k8s/~new', role: 'button', ...props }, children ?? 'Create');
