import { useContext } from 'react';

import { defaultFeatures } from './constants';
import { FeatureContext } from './FeatureContext';
import { FeaturesType } from './types';
import useFeaturesConfigMap from './useFeaturesConfigMap';

const useFeatureReadOnly = (featureName: keyof FeaturesType) => {
  const fromContext = useContext(FeatureContext);
  const {
    featuresConfigMapData: [configMap, loaded, loadError],
  } = useFeaturesConfigMap(!fromContext);
  if (fromContext) {
    const data = fromContext.data ?? defaultFeatures;
    return {
      featureEnabled: data[featureName] === 'true',
      loading: fromContext.isLoading,
      value: data[featureName],
    };
  }

  const data = configMap?.data ?? defaultFeatures;
  const loadingQuery = !configMap && !loaded && !loadError;
  return {
    featureEnabled: data[featureName] === 'true',
    loading: loadingQuery,
    value: data[featureName],
  };
};

export default useFeatureReadOnly;
