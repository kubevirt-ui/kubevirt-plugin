import { isExcludedValue } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/utils';

import { type KubevirtDataPodFilters } from '../types';

import { YAML_PATH_DELIMITER } from './constants';

const toYamlPath = (yamlPath: readonly string[] | string | string[]): string =>
  typeof yamlPath === 'string' ? yamlPath : yamlPath.join(YAML_PATH_DELIMITER);

const addIncludedValue = (
  pathToValues: Map<string, string[]>,
  path: string,
  value: string,
): void => {
  const existingValues = pathToValues.get(path) ?? [];
  if (existingValues.includes(value)) return;
  pathToValues.set(path, [...existingValues, value]);
};

/**
 * Maps UI filter query params to the proxy's yaml-path query string.
 * Repeated keys (status=Running&status=Stopped) are collected and joined with
 * commas because the proxy reads a single value per path and splits on comma.
 * Excluded values (prefixed with !) are omitted so the proxy never treats them as includes.
 */
export const buildProxyFilterQuery = (
  query: URLSearchParams,
  filterOptions?: KubevirtDataPodFilters,
): string => {
  if (!filterOptions) return '';

  const pathToValues = new Map<string, string[]>();

  for (const [key, value] of query.entries()) {
    const yamlPath = filterOptions[key];
    if (!yamlPath) continue;

    const path = toYamlPath(yamlPath);

    if (isExcludedValue(value)) continue;

    addIncludedValue(pathToValues, path, value);
  }

  const url = new URLSearchParams();
  for (const [path, values] of pathToValues) {
    url.set(path, values.join(','));
  }

  return url.toString();
};
