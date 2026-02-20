const YAML_KEY_ORDER = ['apiVersion', 'kind', 'metadata', 'spec', 'status'];

export const YAML_TO_JS_OPTIONS = {
  skipInvalid: true,
  sortKeys: (a: string, b: string) => YAML_KEY_ORDER.indexOf(a) - YAML_KEY_ORDER.indexOf(b),
};

export const YAML_PATH_SUFFIX = '/yaml';
