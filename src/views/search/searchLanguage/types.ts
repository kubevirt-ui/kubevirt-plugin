import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

export type OptionsLookup = Map<string, Map<string, string>>;

export type SearchToken = {
  exclude: boolean;
  filterType?: string;
  operator?: string;
  raw: string;
  searchKey?: string;
  values: string[];
};

export type InvalidKeyError = {
  key: string;
  raw: string;
};

export type InvalidValueError = {
  filterType: string;
  invalidValues: string[];
  searchKey: string;
  validValues: string[];
};

export type ValidationResult = {
  filterState: Partial<KubevirtFilterState>;
  invalidKeyErrors: InvalidKeyError[];
  invalidValueErrors: InvalidValueError[];
  tokenOrder: string[];
};

export type TokenParts = {
  prefix: string;
  suffix: string;
  token: string;
};
