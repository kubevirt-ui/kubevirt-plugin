import {
  CLUSTER_LIST_FILTER_TYPE,
  PROJECT_LIST_FILTER_TYPE,
} from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

type BuildTreeItemQueryOptions = {
  cluster?: string;
  clusters?: string[];
  folderName?: string;
  project?: string;
  query?: string;
};

const clearQueryParams = (params: URLSearchParams): void => {
  params.delete(CLUSTER_LIST_FILTER_TYPE);
  params.delete(PROJECT_LIST_FILTER_TYPE);
  params.delete(VirtualMachineRowFilterType.Group);
};

const addQueryParams = (
  params: URLSearchParams,
  queryParamsToAdd: Record<string, string | undefined>,
): void => {
  for (const [paramName, value] of Object.entries(queryParamsToAdd)) {
    if (value) {
      params.set(paramName, value);
    }
  }
};

const getQueryParamsToAdd = ({
  cluster,
  clusters,
  folderName,
  project,
}: BuildTreeItemQueryOptions): Record<string, string | undefined> => {
  return {
    [CLUSTER_LIST_FILTER_TYPE]: isEmpty(clusters) ? cluster : undefined,
    [PROJECT_LIST_FILTER_TYPE]: project,
    [VirtualMachineRowFilterType.Group]: folderName,
  };
};

export const buildTreeItemQuery = ({
  cluster,
  clusters,
  folderName,
  project,
  query,
}: BuildTreeItemQueryOptions): string => {
  const params = new URLSearchParams(query ?? '');

  clearQueryParams(params);

  if (clusters?.length) {
    for (const clusterName of clusters) {
      params.append(CLUSTER_LIST_FILTER_TYPE, clusterName);
    }
  }

  const queryParamsToAdd = getQueryParamsToAdd({ cluster, clusters, folderName, project });

  addQueryParams(params, queryParamsToAdd);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};
