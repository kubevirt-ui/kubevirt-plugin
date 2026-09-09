export enum ListPageBodySize {
  Lg = 'lg',
  Md = 'md',
  Sm = 'sm',
}

export const getListPageBodySize = (width: number): ListPageBodySize => {
  if (width < 660) return ListPageBodySize.Sm;
  if (width < 1100) return ListPageBodySize.Md;
  return ListPageBodySize.Lg;
};
