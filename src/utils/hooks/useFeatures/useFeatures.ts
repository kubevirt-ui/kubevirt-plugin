import { useCallback, useEffect, useState } from 'react';

import { ConfigMapModel, RoleBindingModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { featuresConfigMapInitialState, featuresRole, featuresRoleBinding } from './constants';
import { UseFeaturesValues } from './types';
import useFeaturesConfigMap from './useFeaturesConfigMap';

type UseFeatures = (featureName: string) => UseFeaturesValues;

const ensureFeaturesRBAC = async () => {
  try {
    await k8sCreate<IoK8sApiRbacV1Role>({
      data: featuresRole,
      model: RoleModel,
    });
  } catch (roleError) {
    if (roleError?.code !== 409) {
      kubevirtConsole.warn('Failed to create kubevirt-ui-features RBAC Role', roleError);
    }
  }

  try {
    await k8sCreate<IoK8sApiRbacV1RoleBinding>({
      data: featuresRoleBinding,
      model: RoleBindingModel,
    });
  } catch (roleBindingError) {
    if (roleBindingError?.code !== 409) {
      kubevirtConsole.warn(
        'Failed to create kubevirt-ui-features RBAC RoleBinding',
        roleBindingError,
      );
    }
  }
};

// Shared so the bootstrap runs once per page load, not once per mounted useFeatures consumer.
let featuresRBACBootstrap: null | Promise<void> = null;

export const useFeatures: UseFeatures = (featureName) => {
  const { featuresConfigMapData, isAdmin } = useFeaturesConfigMap();
  const [featureConfigMap, loaded, loadError] = featuresConfigMapData;
  const [featureEnabled, setFeatureEnabled] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>(null);

  // Ensure the RBAC independently of configmap existence -- HCO may pre-create the configmap
  // itself, which would otherwise skip this bootstrap and leave non-admins 403ing forever.
  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    if (!featuresRBACBootstrap) {
      featuresRBACBootstrap = ensureFeaturesRBAC();
    }
  }, [isAdmin]);

  useEffect(() => {
    let ignore = false;

    if (loadError?.code === 404) {
      setError(loadError);

      // Only admins can bootstrap the shared configmap; non-admins simply fall back to defaults.
      if (isAdmin) {
        const createConfigMap = async () => {
          try {
            await k8sCreate<IoK8sApiCoreV1ConfigMap>({
              data: featuresConfigMapInitialState,
              model: ConfigMapModel,
            });
          } catch (createError) {
            // Don't reinstate a stale error once a later run of this effect has moved on.
            if (!ignore) {
              setError(createError);
            }
          }
        };

        createConfigMap();
      }

      setFeatureEnabled(featuresConfigMapInitialState.data[featureName] === 'true');
      setLoading(false);
      setError(null);

      return () => {
        ignore = true;
      };
    }

    if (!loaded && loadError) {
      setFeatureEnabled(false);
      setLoading(false);
    }

    if (loaded) {
      switch (featureConfigMap?.data?.[featureName]) {
        case 'true':
          setFeatureEnabled(true);
          break;
        case 'false': {
          setFeatureEnabled(false);
          break;
        }
        // In case of features config-map exists but there is a new feature to enter that is missing
        case undefined:
        case null: {
          // Only admins can patch the shared configmap; non-admins simply fall back to defaults.
          if (isAdmin) {
            const applyMissingFeatures = async () => {
              try {
                await k8sPatch({
                  data: [
                    {
                      op: 'replace',
                      path: `/data/${featureName}`,
                      value: featuresConfigMapInitialState.data[featureName],
                    },
                  ],
                  model: ConfigMapModel,
                  resource: featureConfigMap,
                });
              } catch (updateError) {
                setError(updateError);
              }
            };

            applyMissingFeatures();
          }

          setFeatureEnabled(featuresConfigMapInitialState.data[featureName] === 'true');
          break;
        }
        default:
          setFeatureEnabled(featureConfigMap?.data?.[featureName]);
      }
      setLoading(false);
      return;
    }
    // featureEnabled is excluded: it's written by this effect, so including it would re-trigger it.
  }, [loadError, featureConfigMap, loaded, featureName, isAdmin]);

  const toggleFeature = useCallback(
    async (value: boolean) => {
      setLoading(true);

      try {
        const promise = await k8sPatch({
          data: [{ op: 'replace', path: `/data/${featureName}`, value: value.toString() }],
          model: ConfigMapModel,
          resource: featureConfigMap,
        });
        setError(null);
        setFeatureEnabled(promise?.data?.[featureName] === 'true');
        setLoading(false);
        return promise;
      } catch (updateError) {
        setLoading(false);
        setError(updateError);
      }
    },
    [featureConfigMap, featureName],
  );

  return {
    canEdit: isAdmin,
    error,
    featureEnabled,
    loading: loading && !loadError,
    toggleFeature,
  };
};
