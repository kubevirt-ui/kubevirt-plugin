import { type TemplateBootSource } from './utils';

export type UseVMTemplateSourceValue = {
  error: unknown;
  isBootSourceAvailable: boolean;
  loaded: boolean;
  templateBootSource: TemplateBootSource;
};
