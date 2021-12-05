import { SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';
import { getSwaggerDefinitions } from '@openshift-console/dynamic-plugin-sdk-internal-kubevirt';

import {
  FLAG_KUBEVIRT,
  FLAG_KUBEVIRT_HAS_PRINTABLESTATUS,
  FLAG_KUBEVIRT_HAS_V1_API,
  FLAG_KUBEVIRT_HAS_V1ALPHA3_API,
} from './const';

export const detectKubevirtVirtualMachines = async (setFeatureFlag: SetFeatureFlag) => {
  let hasV1APIVersion = false;
  let hasV1Alpha3APIVersion = false;
  let hasPrintableStatus = false;

  // Get swagger schema
  const updateKubevirtFlags = () => {
    const yamlOpenAPI = getSwaggerDefinitions();
    // Check for known apiVersions
    hasV1APIVersion = !!yamlOpenAPI['io.kubevirt.v1.VirtualMachine'];
    hasV1Alpha3APIVersion = !!yamlOpenAPI['io.kubevirt.v1alpha3.VirtualMachine'];

    // Check for shchema features
    if (hasV1APIVersion) {
      hasPrintableStatus =
        !!yamlOpenAPI['io.kubevirt.v1.VirtualMachine']?.properties?.status?.properties
          ?.printableStatus;
    }

    setFeatureFlag(FLAG_KUBEVIRT, hasV1APIVersion || hasV1Alpha3APIVersion);
    setFeatureFlag(FLAG_KUBEVIRT_HAS_V1_API, hasV1APIVersion);
    setFeatureFlag(FLAG_KUBEVIRT_HAS_V1ALPHA3_API, hasV1Alpha3APIVersion && !hasV1APIVersion);
    setFeatureFlag(FLAG_KUBEVIRT_HAS_PRINTABLESTATUS, hasPrintableStatus);
  };

  updateKubevirtFlags();
};
