import {
  CLUSTER_LIST_FILTER_PARAM,
  PROJECT_LIST_FILTER_PARAM,
} from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMListURL } from '@multicluster/urls';

export const getBreadcrumbVMListURL = (clusters?: string[], namespaces?: string[]): string => {
  const baseListURL = getVMListURL();

  const searchParams = new URLSearchParams(location.search);

  if (!isEmpty(namespaces)) {
    searchParams.set(PROJECT_LIST_FILTER_PARAM, namespaces.join(','));
  }

  if (!isEmpty(clusters)) {
    searchParams.set(CLUSTER_LIST_FILTER_PARAM, clusters.join(','));
  }

  return `${baseListURL}${!isEmpty(searchParams) ? `?${searchParams.toString()}` : ''}`;
};
