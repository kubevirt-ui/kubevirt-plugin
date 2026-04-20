import React, { FCC } from 'react';

import { VirtualMachineTemplateRequestModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1alpha1VirtualMachineTemplateRequest } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';

type VirtualMachineTemplateRequestActionsProps = {
  isKebabToggle?: boolean;
  request: V1alpha1VirtualMachineTemplateRequest;
};

const VirtualMachineTemplateRequestActions: FCC<VirtualMachineTemplateRequestActionsProps> = ({
  isKebabToggle,
  request,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const actions = [
    {
      accessReview: asAccessReview(VirtualMachineTemplateRequestModel, request, 'delete'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteModal
            onDeleteSubmit={() =>
              kubevirtK8sDelete({
                cluster: getCluster(request),
                model: VirtualMachineTemplateRequestModel,
                resource: request,
              })
            }
            headerText={t('Delete request for VirtualMachine template?')}
            isOpen={isOpen}
            obj={request}
            onClose={onClose}
            shouldRedirect={false}
          />
        )),
      id: 'delete-vm-template-request',
      label: t('Delete'),
    },
  ];

  return <ActionsDropdown actions={actions} isKebabToggle={isKebabToggle} />;
};

export default VirtualMachineTemplateRequestActions;
