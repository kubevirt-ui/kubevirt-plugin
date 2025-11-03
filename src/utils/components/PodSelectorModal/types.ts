export type FromRequirementsOptions = {
  basic?: boolean;
  undefinedWhenEmpty?: boolean;
};

export interface Requirement {
  key: string;
  operator: string;
  values: string[];
}
