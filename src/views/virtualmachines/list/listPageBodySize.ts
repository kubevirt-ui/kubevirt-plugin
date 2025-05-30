export enum ListPageBodySize {
  lg = 'lg',
  md = 'md',
  sm = 'sm',
}

export const getListPageBodySize = (width: number) => {
  if (width < 660) return ListPageBodySize.sm;
  if (width < 735) return ListPageBodySize.md;
  return ListPageBodySize.lg;
};
