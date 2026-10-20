import { type AllowedNamespacesFailure } from './types';

export type AllowedNamespacesLoaderResult = {
  allowedNamespaces: string[];
  error: Error | null;
  failures: AllowedNamespacesFailure[];
  filterByAllowedNamespaces: boolean;
  loaded: boolean;
};
