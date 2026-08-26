import { getACMTextSearchURL } from '@multicluster/urls';

export const getSearchLabelHREF = (
  kind: string,
  labelKey: string,
  labelValue: string,
  cluster?: string,
): string => {
  if (cluster) {
    return getACMTextSearchURL(`cluster:${cluster} kind:${kind} label:${labelKey}=${labelValue}`);
  }

  const labelParam = `${labelKey}=${labelValue}`;
  return `/search?kind=${kind}&q=${encodeURIComponent(labelParam)}`;
};
