import { useMemo } from 'react';

import {
  BuildConfigModel,
  DeploymentConfigModel,
  ImageStreamImportsModel,
  ImageStreamModel,
  RouteModel,
  SecretModel,
  ServiceModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { useAccessReview, useFlag } from '@openshift-console/dynamic-plugin-sdk';

import { ALLOW_SERVICE_BINDING_FLAG } from '../../../../../const';
import {
  ALL_CATALOG_IMAGE_RESOURCE_ACCESS,
  ALL_IMPORT_RESOURCE_ACCESS,
  SERVICE_BINDING_ENABLED,
} from '../../../../../utils/knative/knative-const';

import { resourceAttributes } from './utils/utils';

const useAddToProjectAccess = (activeNamespace: string): string[] => {
  const buildConfigsAccess = useAccessReview(resourceAttributes(BuildConfigModel, activeNamespace));
  const imageStreamAccess = useAccessReview(resourceAttributes(ImageStreamModel, activeNamespace));
  const deploymentConfigAccess = useAccessReview(
    resourceAttributes(DeploymentConfigModel, activeNamespace),
  );
  const imageStreamImportAccess = useAccessReview(
    resourceAttributes(ImageStreamImportsModel, activeNamespace),
  );
  const secretAccess = useAccessReview(resourceAttributes(SecretModel, activeNamespace));
  const routeAccess = useAccessReview(resourceAttributes(RouteModel, activeNamespace));
  const serviceAccess = useAccessReview(resourceAttributes(ServiceModel, activeNamespace));

  const serviceBindingEnabled = useFlag(ALLOW_SERVICE_BINDING_FLAG);

  return useMemo(() => {
    const createResourceAccess: string[] = [];
    if (
      buildConfigsAccess &&
      imageStreamAccess &&
      deploymentConfigAccess &&
      secretAccess &&
      routeAccess &&
      serviceAccess
    ) {
      createResourceAccess.push(ALL_IMPORT_RESOURCE_ACCESS);
      if (imageStreamImportAccess) {
        createResourceAccess.push(ALL_CATALOG_IMAGE_RESOURCE_ACCESS);
      }
    }
    if (serviceBindingEnabled) {
      createResourceAccess.push(SERVICE_BINDING_ENABLED);
    }
    return createResourceAccess;
  }, [
    buildConfigsAccess,
    deploymentConfigAccess,
    imageStreamAccess,
    imageStreamImportAccess,
    routeAccess,
    secretAccess,
    serviceAccess,
    serviceBindingEnabled,
  ]);
};

export default useAddToProjectAccess;
