export enum ListManagementGroupSize {
  lg = 'lg',
  md = 'md',
  sm = 'sm',
}

export const getListManagementGroupSize = (width: number) => {
  if (width < 880) return ListManagementGroupSize.sm;
  if (width < 1090) return ListManagementGroupSize.md;
  return ListManagementGroupSize.lg;
};
