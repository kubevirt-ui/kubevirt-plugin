export const getSearchLabelHREF = (
  kind: string,
  labelKey: string,
  labelValue: string,
  cluster?: string,
) => {
  if (cluster) {
    const encodedTextFilter = encodeURIComponent(
      `cluster:${cluster} kind:${kind} label:${labelKey}=${labelValue}`,
    );
    return `/multicloud/search?filters={"textsearch":"${encodedTextFilter}"}`;
  }

  return `/search?kind=${kind}&q=${encodeURIComponent(`${labelKey}=${labelValue}`)}`;
};
