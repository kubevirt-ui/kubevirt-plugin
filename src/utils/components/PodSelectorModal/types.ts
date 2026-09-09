export type FromRequirementsOptions = {
  basic?: boolean;
  undefinedWhenEmpty?: boolean;
};

export type Requirement = {
  key: string;
  operator: string;
  values: string[];
};
