import { getACMTextSearchURL } from '@multicluster/urls';

export const getSearchLabelHREF = (
  kind: string,
  labelKey: string,
  labelValue: string,
  cluster?: string,
) => {
  if (cluster) {
    return getACMTextSearchURL(`cluster:${cluster} kind:${kind} label:${labelKey}=${labelValue}`);
  }

  return `/search?kind=${kind}&q=${encodeURIComponent(`${labelKey}=${labelValue}`)}`;
};
