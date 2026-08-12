import fuzzy from 'fuzzysearch';
import { type TFunction } from 'i18next';

import { type IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  DEFAULT_NAMESPACE,
  KUBEVIRT_HYPERCONVERGED,
  KUBEVIRT_OS_IMAGES_NS,
  OPENSHIFT_CNV,
  OPENSHIFT_OS_IMAGES_NS,
} from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { k8sBasePath } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/k8s';

export * from './errorUtils';
export * from './ipUtils';
export * from './matchExpressions';
export * from './nameGenerators';
export * from './sortingUtils';

// JSON Pointer (RFC 6901) requires `/` in keys to be escaped as `~1`
export const escapeJsonPointerToken = (token: string): string => token.replace(/\//g, '~1');

export const kubevirtConsole = console;

export const clusterBasePath = k8sBasePath.slice(0, k8sBasePath.lastIndexOf('api/kubernetes'));

export const isAllNamespaces = (namespace: string): boolean =>
  !namespace || namespace === ALL_NAMESPACES || namespace === ALL_NAMESPACES_SESSION_KEY;

export const getValidNamespace = (activeNamespace: string): string =>
  activeNamespace === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : activeNamespace;

export const getNamespacePathSegment = (namespace: string): string =>
  isAllNamespaces(namespace) ? ALL_NAMESPACES : `ns/${namespace}`;

export const isEmpty = (obj: unknown): boolean =>
  [Array, Object].includes(((obj || {}) as object).constructor as ArrayConstructor) &&
  !Object.entries((obj || {}) as object).length;

export const sumObjectValues = (obj: Record<string, number | undefined>): number =>
  Object.values(obj).reduce((acc, val) => acc + (val ?? 0), 0);

export const get = (
  obj: unknown,
  path: string | string[],
  defaultValue: unknown = undefined,
): unknown => {
  const travel = (regexp: RegExp): unknown =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res: unknown, key: string) => (res != null ? (res as Record<string, unknown>)[key] : res),
        obj,
      );
  const result = travel(/[,[\]]+/) ?? travel(/[,[\].]+/);
  return result === undefined || result === obj ? defaultValue : result;
};

export const pick = (object: Record<string, unknown>, keys: string[]): Record<string, unknown> => {
  return keys.reduce((obj: Record<string, unknown>, key: string) => {
    if (object?.hasOwnProperty(key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

export const isUpstream: boolean = window.SERVER_FLAGS.branding === 'okd';

export const DEFAULT_OPERATOR_NAMESPACE = isUpstream ? KUBEVIRT_HYPERCONVERGED : OPENSHIFT_CNV;

export const OS_IMAGES_NS = isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS;

export const isString = (val: unknown): boolean => val !== null && typeof val === 'string';

export const getSSHNodePort = (sshService: IoK8sApiCoreV1Service): number =>
  sshService?.spec?.ports?.find((port) => parseInt(port.targetPort, 10) === 22)?.nodePort;

export const isTemplateParameter = (value: string): boolean => Boolean(/^\${\w+}$/.test(value));

export const SSH_PUBLIC_KEY_VALIDATION_REGEX =
  /^(ssh-(rsa|dss|ed25519)|sk-ssh-(rsa|ed25519)@openssh\.com|ecdsa-sha2-nistp(256|384|521))\s+[A-Za-z0-9+/=]+(?:\s+\S.*)?$/;

export const validateSSHPublicKey = (value: string): boolean => {
  const trimmedValue = value?.trim();
  return isEmpty(trimmedValue) || Boolean(SSH_PUBLIC_KEY_VALIDATION_REGEX?.test(trimmedValue));
};

export const getContentScrollableElement = (): HTMLElement =>
  document.getElementById('content-scrollable') ?? document.body;

export const findAllIndexes = <T>(
  array: T[],
  predicate: (element: T, index: number, array: T[]) => boolean,
): number[] =>
  Array.from(array.entries()).reduce<number[]>(
    (acc, [index, element]) => (predicate(element, index, array) ? [...acc, index] : acc),
    [],
  );

export const ensurePath = <T extends object>(data: T, paths: string | string[]): void => {
  let current: Record<string, unknown> = data as Record<string, unknown>;

  if (Array.isArray(paths)) {
    for (const path of paths) ensurePath(data, path);
  } else {
    const keys = paths.split('.');

    for (const key of keys) {
      if (!current[key]) current[key] = {};
      current = current[key] as Record<string, unknown>;
    }
  }
};

export const getNoPermissionTooltipContent = (t: TFunction): string =>
  t(`You don't have permission to perform this action`);

export const getNoDataAvailableMessage = (t: TFunction): string => t('No data available');

export const parseJSONAnnotation = <T = unknown>(
  annotations: Record<string, string> | undefined,
  key: string,
  options?: { onError?: (error: unknown) => void; validate?: (value: unknown) => boolean },
): T => {
  const { onError, validate } = options ?? {};
  const annotation = annotations?.[key];
  if (!annotation) {
    return null as T;
  }
  try {
    const parsed: T = JSON.parse(annotation) as T;
    const valid = validate?.(parsed) ?? true;
    if (!valid) {
      throw new Error(`Invalid value: "${annotation}"`);
    }
    return parsed;
  } catch (error) {
    onError?.((error as Error).message);
    return null as T;
  }
};

export const fuzzyCaseInsensitive = (a: string, b: string): boolean =>
  fuzzy(a.toLowerCase(), b.toLowerCase());
