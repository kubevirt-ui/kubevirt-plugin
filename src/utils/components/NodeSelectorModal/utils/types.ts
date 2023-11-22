export type IDEntity = {
  id: number;
};

export type IDLabel = IDEntity & {
  key: string;
  value?: string;
};
