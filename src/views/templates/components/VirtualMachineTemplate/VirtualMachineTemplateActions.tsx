import React, { FC } from 'react';

import { VirtualMachineTemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1alpha1VirtualMachineTemplate } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview, getLabels } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { getLabelsDiffPatch } from '@virtualmachines/actions/utils';

type VirtualMachineTemplateActionsProps = {
  isKebabToggle?: boolean;
  vmTemplate: V1alpha1VirtualMachineTemplate;
};

const VirtualMachineTemplateActions: FC<VirtualMachineTemplateActionsProps> = ({
  isKebabToggle,
  vmTemplate,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const cluster = getCluster(vmTemplate);

  const actions = [
    {
      accessReview: asAccessReview(VirtualMachineTemplateModel, vmTemplate, K8S_OPS.PATCH),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <LabelsModal
            onLabelsSubmit={(labels) =>
              kubevirtK8sPatch({
                cluster,
                data: getLabelsDiffPatch(labels, getLabels(vmTemplate, {}), getLabels(vmTemplate)),
                model: VirtualMachineTemplateModel,
                resource: vmTemplate,
              })
            }
            isOpen={isOpen}
            obj={vmTemplate}
            onClose={onClose}
          />
        )),
      id: 'edit-labels',
      label: t('Edit labels'),
    },
    {
      accessReview: asAccessReview(VirtualMachineTemplateModel, vmTemplate, K8S_OPS.DELETE),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteModal
            onDeleteSubmit={() =>
              kubevirtK8sDelete({
                cluster,
                model: VirtualMachineTemplateModel,
                resource: vmTemplate,
              })
            }
            headerText={t('Delete VirtualMachine Template?')}
            isOpen={isOpen}
            obj={vmTemplate}
            onClose={onClose}
            shouldRedirect={false}
          />
        )),
      id: 'delete-vm-template',
      label: t('Delete'),
    },
  ];

  return <ActionsDropdown actions={actions} isKebabToggle={isKebabToggle} />;
};

export default VirtualMachineTemplateActions;
