import type { ReactNode } from 'react';

import type { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { getGalleryWatchList } from '../stories/gallery-watch-registry';

export { k8sBasePath } from './openshift-console-sdk-k8s';

type NamespaceTuple = [string, (ns: string) => void];

const noop = (): void => undefined;

export const useActiveNamespace = (): NamespaceTuple => ['default', noop];

export const useActivePerspective = (): [string, (p: string) => void] => ['admin', noop];

export const DocumentTitle = ({ children }: { children?: ReactNode }): ReactNode =>
  children ?? null;

export const ListPageHeader = ({
  children,
  title,
}: {
  children?: ReactNode;
  title?: ReactNode;
}): ReactNode => (
  <div data-test="list-page-header">
    {title}
    {children}
  </div>
);

export const ListPageBody = ({ children }: { children?: ReactNode }): ReactNode => (
  <div data-test="list-page-body">{children}</div>
);

export const useK8sWatchResource = <T,>(watchOptions?: WatchK8sResource): [T, boolean, unknown] => {
  const list = getGalleryWatchList(watchOptions);
  if (watchOptions?.isList) {
    return [(list ?? []) as T, true, null];
  }
  return [(list?.[0] ?? undefined) as T, true, null];
};

export const ListPageCreate = ({
  children,
  ...props
}: {
  children?: ReactNode;
  groupVersionKind?: unknown;
}): ReactNode => (
  <a href="/k8s/~new" role="button" {...props}>
    {children ?? 'Create'}
  </a>
);

export const useK8sModel = (): [Record<string, unknown>, boolean] => [
  { abbr: 'CM', apiVersion: 'v1', kind: 'ConfigMap', label: 'Config Map', plural: 'configmaps' },
  true,
];

export const useK8sModels = (): [Record<string, unknown>, boolean] => [{}, true];

export const getGroupVersionKindForResource = (): {
  group: string;
  kind: string;
  version: string;
} => ({
  group: '',
  kind: 'ConfigMap',
  version: 'v1',
});

export const useK8sWatchResources = (): [Record<string, unknown>, boolean, unknown] => [
  {},
  true,
  null,
];

export const k8sCreate = async (): Promise<unknown> => ({});

export const k8sUpdate = async (): Promise<unknown> => ({});

export const k8sDelete = async (): Promise<unknown> => ({});

export const k8sPatch = async (): Promise<unknown> => ({});

export type K8sResourceCommon = {
  apiVersion?: string;
  kind?: string;
  metadata?: { name?: string; namespace?: string };
};

export type MenuOption = Record<string, unknown>;

export const checkAccess = async (): Promise<boolean> => true;

export const ActionServiceProvider = ({ children }: { children?: ReactNode }): ReactNode =>
  children;

export const ActionService = (): null => null;

export const useResolvedExtensions = <T,>(
  _predicate?: (extension: unknown) => boolean,
): [T[], boolean] => [[], true];

export const HealthState = {
  ERROR: 'ERROR',
  LOADING: 'LOADING',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  OK: 'OK',
  PROGRESS: 'PROGRESS',
  UNKNOWN: 'UNKNOWN',
  UPDATING: 'UPDATING',
  WARNING: 'WARNING',
} as const;

export const RuleStates = {
  Firing: 'firing',
  Inactive: 'inactive',
  Pending: 'pending',
} as const;

export const Timestamp = ({
  className,
  timestamp,
}: {
  className?: string;
  simple?: boolean;
  timestamp?: string;
}): ReactNode => <span className={className}>{timestamp ?? '—'}</span>;

export const ResourceEventStream = (): ReactNode => <div data-test="resource-event-stream" />;

export const Overview = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}): ReactNode => <div className={className}>{children}</div>;

export const StatusIconAndText = ({
  icon,
  title,
}: {
  icon?: ReactNode;
  title?: ReactNode;
}): ReactNode => (
  <span>
    {icon}
    {title}
  </span>
);
