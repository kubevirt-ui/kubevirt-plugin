const BREAKPOINT_SM = 576;
const BREAKPOINT_MD = 768;
const BREAKPOINT_LG = 992;
const BREAKPOINT_XL = 1200;
export const BREAKPOINT_XXL = 1400;

const MAX_COL_XS = 2;
const MAX_COL_SM = 4;
const MAX_COL_MD = 4;
const MAX_COL_LG = 6;
const MAX_COL_XL = 8;

const getMaxVisibleColumns = (width: number): number => {
  if (width < BREAKPOINT_SM) return MAX_COL_XS;
  if (width < BREAKPOINT_MD) return MAX_COL_SM;
  if (width < BREAKPOINT_LG) return MAX_COL_MD;
  if (width < BREAKPOINT_XL) return MAX_COL_LG;
  if (width < BREAKPOINT_XXL) return MAX_COL_XL;
  return Infinity;
};

export const isColumnVisible = (width: number, columnIndex: number, columnKey: string): boolean => {
  if (columnKey === '' || columnKey === 'actions') return true;
  const maxVisible = getMaxVisibleColumns(width);
  return columnIndex < maxVisible;
};
