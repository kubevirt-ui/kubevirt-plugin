export enum ListManagementGroupSize {
  lg = 'lg',
  md = 'md',
  sm = 'sm',
}

export const getListManagementGroupSize = (width: number) => {
  if (width < 660) return ListManagementGroupSize.sm;
  if (width < 735) return ListManagementGroupSize.md;
  return ListManagementGroupSize.lg;
};
