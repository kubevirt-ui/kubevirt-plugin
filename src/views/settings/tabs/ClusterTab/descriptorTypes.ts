// Extracted from types.ts
// Root: src/views/clusteroverview/utils/types.ts

export type Descriptor<T = unknown> = {
  description: string;
  displayName: string;
  path: string;
  value?: unknown;
  'x-descriptors'?: T[];
};

export type CRDDescription = {
  description?: string;
  displayName: string;
  kind: string;
  name: string;
  resources?: {
    kind: string;
    name?: string;
    version: string;
  }[];
  specDescriptors?: Descriptor[];
  statusDescriptors?: Descriptor[];
  version: string;
};

export type APIServiceDefinition = {
  containerPort: number;
  deploymentName: string;
  description?: string;
  displayName: string;
  group: string;
  kind: string;
  name: string;
  resources?: {
    kind: string;
    name?: string;
    version: string;
  }[];
  specDescriptors?: Descriptor[];
  statusDescriptors?: Descriptor[];
  version: string;
};
