import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import {
  KUBEVIRT_OS_IMAGES_NS,
  OPENSHIFT_NAMESPACE,
  OPENSHIFT_OS_IMAGES_NS,
} from '@kubevirt-utils/constants/constants';
import { FLAG_KUBEVIRT_CDI } from '@kubevirt-utils/flags/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useAccessReview, useFlag } from '@openshift-console/dynamic-plugin-sdk';

type Key = 'attacheNetworks' | 'clone' | 'uploadImage';

export type UsePermissions = () => {
  capabilitiesData: { [key in Key]: { allowed: boolean; isLoading: boolean; taskName: string } };
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

  const [canReadNads, canReadNadsLoading] = useAccessReview({
    resource: NetworkAttachmentDefinitionModel.plural,
    verb: 'get',
  });

  const canReadOsImagesNs = canReadKvOsImgNs && canReadOpenshiftOsImgNs;
  const canReadOsImagesNsLoading = canReadKvOsImgNsLoading && canReadOpenshiftOsImgNsLoading;

  const basePermissionsAllowed = canReadOpenshiftNs && canReadOsImagesNs;
  const basePermissionsLoading = canReadOpenshiftNsLoading && canReadOsImagesNsLoading;

  const capabilitiesData = {
    attacheNetworks: {
      allowed: basePermissionsAllowed && canReadNads,
      isLoading: basePermissionsLoading && canReadNadsLoading,
      taskName: t('Attach VirtualMachine to multiple networks'),
    },
    clone: {
      allowed: basePermissionsAllowed && cdiInstalled,
      isLoading: basePermissionsLoading,
      taskName: t('Clone a VirtualMachine'),
    },
    uploadImage: {
      allowed: basePermissionsAllowed && canWriteToKvOsImgNs,
      isLoading: basePermissionsLoading && canWriteToKvOsImgNsLoading,
      taskName: t('Upload a base image from local disk'),
    },
  };

  const isLoading = !isEmpty(
    Object.values(capabilitiesData)?.filter((task) => task.isLoading === true),
  );

  return {
    capabilitiesData,
    isLoading,
  };
};

export default usePermissions;
