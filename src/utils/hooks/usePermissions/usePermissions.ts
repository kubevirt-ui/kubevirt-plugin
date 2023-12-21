import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import VirtualMachineCloneModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineCloneModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UploadTokenRequestModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useAccessReview, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { ALL_NAMESPACES_SESSION_KEY } from '../constants';

type Key = 'attacheNetworks' | 'clone' | 'uploadImage';

export type UsePermissions = () => {
  capabilitiesData: { [key in Key]: { allowed: boolean; isLoading: boolean; taskName: string } };
  isLoading: boolean;
};

const usePermissions: UsePermissions = () => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();

  const [canReadNads, canReadNadsLoading] = useAccessReview({
    group: NetworkAttachmentDefinitionModel.apiGroup,
    ...(activeNamespace !== ALL_NAMESPACES_SESSION_KEY && { namespace: activeNamespace }),
    resource: NetworkAttachmentDefinitionModel.plural,
    verb: 'get',
  });

  const [canCloneVM, canCloneVMLoading] = useAccessReview({
    group: VirtualMachineCloneModel.apiGroup,
    ...(activeNamespace !== ALL_NAMESPACES_SESSION_KEY && { namespace: activeNamespace }),
    resource: VirtualMachineCloneModel.plural,
    verb: 'create',
  });

  const [canCreateUploadToken, canCreateUploadTokenLoading] = useAccessReview({
    group: UploadTokenRequestModel.apiGroup,
    ...(activeNamespace !== ALL_NAMESPACES_SESSION_KEY && { namespace: activeNamespace }),
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
      allowed: canCloneVM,
      isLoading: canCloneVMLoading,
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
