import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import { FLAG_KUBEVIRT_CDI } from '@kubevirt-utils/flags/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sVerb, useAccessReview, useFlag } from '@openshift-console/dynamic-plugin-sdk';

import {
  KUBEVIRT_OS_IMAGES_NS,
  NAMESPACE_OPENSHIFT,
  OPENSHIFT_OS_IMAGES_NS,
} from '../utils/constants';

export type UseOverviewPermissions = {
  capabilitiesData: { taskName: string; isLoading: boolean; allowed: boolean }[];
  permissionsLoading: boolean;
  numAllowedCapabilities: number;
  numNotAllowedCapabilities: number;
};

export const usePermissionsCardPermissions = (): UseOverviewPermissions => {
  const { t } = useKubevirtTranslation();
  const cdiInstalled = useFlag(FLAG_KUBEVIRT_CDI);

  const [canReadOpenshiftNs, canReadOpenshiftNsLoading] = useAccessReview({
    namespace: NAMESPACE_OPENSHIFT,
    verb: 'get' as K8sVerb,
    resource: TemplateModel.plural,
  });

  const [canWriteToOpenshiftNs, canWriteToOpenshiftNsLoading] = useAccessReview({
    namespace: NAMESPACE_OPENSHIFT,
    verb: 'create' as K8sVerb,
    resource: TemplateModel.plural,
  });

  const [canReadOpenshiftOsImgNs, canReadOpenshiftOsImgNsLoading] = useAccessReview({
    namespace: OPENSHIFT_OS_IMAGES_NS,
    verb: 'get' as K8sVerb,
    resource: TemplateModel.plural,
  });

  const [canReadKvOsImgNs, canReadKvOsImgNsLoading] = useAccessReview({
    namespace: KUBEVIRT_OS_IMAGES_NS,
    verb: 'get' as K8sVerb,
    resource: TemplateModel.plural,
  });

  const [canWriteToKvOsImgNs, canWriteToKvOsImgNsLoading] = useAccessReview({
    namespace: KUBEVIRT_OS_IMAGES_NS,
    verb: 'create' as K8sVerb,
    resource: TemplateModel.plural,
  });

  const [canWriteToOpenshiftOsImgNs, canWriteToOpenshiftOsImgNsLoading] = useAccessReview({
    namespace: OPENSHIFT_OS_IMAGES_NS,
    verb: 'create' as K8sVerb,
    resource: TemplateModel.plural,
  });

  const [canReadNads, canReadNadsLoading] = useAccessReview({
    verb: 'get' as K8sVerb,
    resource: NetworkAttachmentDefinitionModel.plural,
  });

  const canReadOsImagesNs = canReadKvOsImgNs && canReadOpenshiftOsImgNs;
  const canReadOsImagesNsLoading = canReadKvOsImgNsLoading && canReadOpenshiftOsImgNsLoading;

  const basePermissionsAllowed = canReadOpenshiftNs && canReadOsImagesNs;
  const basePermissionsLoading = canReadOpenshiftNsLoading && canReadOsImagesNsLoading;

  const canWriteToOsImagesNs = canWriteToKvOsImgNs && canWriteToOpenshiftOsImgNs;
  const canWriteToOsImagesNsLoading =
    canWriteToKvOsImgNsLoading && canWriteToOpenshiftOsImgNsLoading;

  const capabilitiesData = [
    {
      taskName: t('Access to public templates'),
      isLoading: basePermissionsLoading,
      allowed: basePermissionsAllowed,
    },
    {
      taskName: t('Access to public boot sources'),
      isLoading: basePermissionsLoading,
      allowed: basePermissionsAllowed,
    },
    {
      taskName: t('Clone a VirtualMachine'),
      isLoading: basePermissionsLoading,
      allowed: basePermissionsAllowed && cdiInstalled,
    },
    {
      taskName: t('Attach VirtualMachine to multiple networks'),
      isLoading: basePermissionsLoading && canReadNadsLoading,
      allowed: basePermissionsAllowed && canReadNads,
    },
    {
      taskName: t('Upload a base image from local disk'),
      isLoading: basePermissionsLoading && canWriteToKvOsImgNsLoading,
      allowed: basePermissionsAllowed && canWriteToKvOsImgNs,
    },
    {
      taskName: t('Share templates'),
      isLoading:
        basePermissionsLoading && canWriteToOpenshiftNsLoading && canWriteToOsImagesNsLoading,
      allowed: basePermissionsAllowed && canWriteToOpenshiftNs && canWriteToOsImagesNs,
    },
  ];

  const numAllowedCapabilities = capabilitiesData.reduce(
    (acc, task) => (task.allowed ? acc + 1 : acc),
    0,
  );
  const numNotAllowedCapabilities = capabilitiesData?.length - numAllowedCapabilities;
  const permissionsLoading = capabilitiesData.filter((task) => task.isLoading === true).length > 0;

  return {
    capabilitiesData,
    permissionsLoading,
    numAllowedCapabilities,
    numNotAllowedCapabilities,
  };
};
