import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import {
  KUBEVIRT_OS_IMAGES_NS,
  OPENSHIFT_NAMESPACE,
  OPENSHIFT_OS_IMAGES_NS,
} from '@kubevirt-utils/constants/constants';
import { FLAG_KUBEVIRT_CDI } from '@kubevirt-utils/flags/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useAccessReview, useFlag } from '@openshift-console/dynamic-plugin-sdk';

export type UsePermissions = () => {
  capabilitiesData: { allowed: boolean; isLoading: boolean; taskName: string }[];
  isLoading: boolean;
};

const usePermissions: UsePermissions = () => {
  const { t } = useKubevirtTranslation();
  const cdiInstalled = useFlag(FLAG_KUBEVIRT_CDI);

  const [canReadOpenshiftNs, canReadOpenshiftNsLoading] = useAccessReview({
    namespace: OPENSHIFT_NAMESPACE,
    resource: TemplateModel.plural,
    verb: 'get',
  });

  const [canWriteToOpenshiftNs, canWriteToOpenshiftNsLoading] = useAccessReview({
    namespace: OPENSHIFT_NAMESPACE,
    resource: TemplateModel.plural,
    verb: 'create',
  });

  const [canReadOpenshiftOsImgNs, canReadOpenshiftOsImgNsLoading] = useAccessReview({
    namespace: OPENSHIFT_OS_IMAGES_NS,
    resource: TemplateModel.plural,
    verb: 'get',
  });

  const [canReadKvOsImgNs, canReadKvOsImgNsLoading] = useAccessReview({
    namespace: KUBEVIRT_OS_IMAGES_NS,
    resource: TemplateModel.plural,
    verb: 'get',
  });

  const [canWriteToKvOsImgNs, canWriteToKvOsImgNsLoading] = useAccessReview({
    namespace: KUBEVIRT_OS_IMAGES_NS,
    resource: TemplateModel.plural,
    verb: 'create',
  });

  const [canWriteToOpenshiftOsImgNs, canWriteToOpenshiftOsImgNsLoading] = useAccessReview({
    namespace: OPENSHIFT_OS_IMAGES_NS,
    resource: TemplateModel.plural,
    verb: 'create',
  });

  const [canReadNads, canReadNadsLoading] = useAccessReview({
    resource: NetworkAttachmentDefinitionModel.plural,
    verb: 'get',
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
      allowed: basePermissionsAllowed,
      isLoading: basePermissionsLoading,
      taskName: t('Access to public templates'),
    },
    {
      allowed: basePermissionsAllowed,
      isLoading: basePermissionsLoading,
      taskName: t('Access to public boot sources'),
    },
    {
      allowed: basePermissionsAllowed && cdiInstalled,
      isLoading: basePermissionsLoading,
      taskName: t('Clone a VirtualMachine'),
    },
    {
      allowed: basePermissionsAllowed && canReadNads,
      isLoading: basePermissionsLoading && canReadNadsLoading,
      taskName: t('Attach VirtualMachine to multiple networks'),
    },
    {
      allowed: basePermissionsAllowed && canWriteToKvOsImgNs,
      isLoading: basePermissionsLoading && canWriteToKvOsImgNsLoading,
      taskName: t('Upload a base image from local disk'),
    },
    {
      allowed: basePermissionsAllowed && canWriteToOpenshiftNs && canWriteToOsImagesNs,
      isLoading:
        basePermissionsLoading && canWriteToOpenshiftNsLoading && canWriteToOsImagesNsLoading,
      taskName: t('Share templates'),
    },
  ];

  const isLoading = capabilitiesData.filter((task) => task.isLoading === true).length > 0;

  return {
    capabilitiesData,
    isLoading,
  };
};

export default usePermissions;
