import { dump, type DumpOptions, load, type LoadOptions } from 'js-yaml';

import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

const isBlankYAML = (yaml: null | string | undefined): boolean =>
  yaml === null || yaml === undefined || yaml.trim() === '';

// Safely parse js obj to yaml. Returns fallback (empty string by default) on exception.
export const safeJSToYAML = (value: unknown, fallback = '', options: DumpOptions = {}): string => {
  try {
    return dump(value, options);
  } catch (error) {
    kubevirtConsole.error(error);
    return fallback;
  }
};

// Safely parse yaml to js object. Returns fallback on empty input (js-yaml v5+) or parse errors.
// fallback is required so callers can pass undefined without it being replaced by a default.
export const safeYAMLToJS = <T>(
  yaml: null | string | undefined,
  fallback: T,
  options: LoadOptions = {},
): T => {
  if (isBlankYAML(yaml)) {
    return fallback;
  }

  try {
    return load(yaml, options) as T;
  } catch {
    return fallback;
  }
};

export const asyncJSToYAML = (value: unknown, options: DumpOptions = {}): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      resolve(dump(value, options));
    } catch (error) {
      reject(error);
    }
  });
};

export const asyncYAMLToJS = (yaml: string, options: LoadOptions = {}): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    if (isBlankYAML(yaml)) {
      reject(new Error('expected a document, but the input is empty'));
      return;
    }

    try {
      resolve(load(yaml, options));
    } catch (error) {
      reject(error);
    }
  });
};
