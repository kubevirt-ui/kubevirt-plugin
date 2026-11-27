import { type CloudIdentityProvider } from '../types/types';

type VMProviderConfig = {
  templateLabels: Record<string, string>;
};

export const vmProviderMap: Record<CloudIdentityProvider, VMProviderConfig> = {
  aws: {
    templateLabels: {},
  },
};
