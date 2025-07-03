import { createContext } from 'react';

import { FeaturesType } from './types';

export type FeaturesContextType = {
  data: FeaturesType;
  isLoading: boolean;
};
export const FeatureContext = createContext<FeaturesContextType>(null);
