export type OptionsLookup = Map<string, Map<string, string>>;

export type SearchToken = {
  exclude: boolean;
  key: string;
  operator?: string;
  raw: string;
  values: string[];
};
