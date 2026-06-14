type SearchTip = {
  description: string;
  query: string;
};

export type SearchTipsSection = {
  note?: string;
  tips: SearchTip[];
  title: string;
};
