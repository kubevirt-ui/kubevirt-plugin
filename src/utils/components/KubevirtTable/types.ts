export type ColumnLayoutColumn = {
  additional?: boolean;
  id: string;
  title: string;
};

export type ColumnLayout = {
  columns: ColumnLayoutColumn[];
  id: string;
  selectedColumns: Set<string>;
  type: string;
};
