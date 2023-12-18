import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import { FLAG_KUBEVIRT_CDI } from '@kubevirt-utils/flags/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UploadTokenRequestModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  useAccessReview,
  useActiveNamespace,
  useFlag,
} from '@openshift-console/dynamic-plugin-sdk';

type Key = 'attacheNetworks' | 'clone' | 'uploadImage';

export type UsePermissions = () => {
  capabilitiesData: { [key in Key]: { allowed: boolean; isLoading: boolean; taskName: string } };
  isLoading: boolean;
};

const usePermissions: UsePermissions = () => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const cdiInstalled = useFlag(FLAG_KUBEVIRT_CDI);

  const [canReadNads, canReadNadsLoading] = useAccessReview({
    group: NetworkAttachmentDefinitionModel.apiGroup,
    namespace: activeNamespace,
    resource: NetworkAttachmentDefinitionModel.plural,
    verb: 'get',
  });

  const [canCreateUploadToken, canCreateUploadTokenLoading] = useAccessReview({
    group: UploadTokenRequestModel.apiGroup,
    namespace: activeNamespace,
    resource: UploadTokenRequestModel.plural,
    verb: 'create',
  });

  const capabilitiesData = {
    attacheNetworks: {
      allowed: canReadNads,
      isLoading: canReadNadsLoading,
      taskName: t('Attach VirtualMachine to multiple networks'),
    },
    clone: {
      allowed: cdiInstalled,
      isLoading: false,
      taskName: t('Clone a VirtualMachine'),
    },
    uploadImage: {
      allowed: canCreateUploadToken,
      isLoading: canCreateUploadTokenLoading,
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
