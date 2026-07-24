import React, { type FC } from 'react';

import { VirtualMachineTemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1VirtualMachineTemplate } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import EditCategoryModal from '@kubevirt-utils/components/EditCategoryModal/EditCategoryModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview, getLabels } from '@kubevirt-utils/resources/shared';
import { getTemplateCategory, updateTemplateCategory } from '@kubevirt-utils/resources/template';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { getLabelsDiffPatch } from '@virtualmachines/actions/utils';

type VirtualMachineTemplateActionsProps = {
  isKebabToggle?: boolean;
  vmTemplate: V1beta1VirtualMachineTemplate;
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
      cta: (): void => {
        createModal(({ isOpen, onClose }) => (
          <EditCategoryModal
            initialCategory={getTemplateCategory(vmTemplate) ?? ''}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={(category) => updateTemplateCategory({ category, template: vmTemplate })}
          />
        ));
      },
      id: 'edit-category',
      label: t('Edit category'),
    },
    {
      accessReview: asAccessReview(VirtualMachineTemplateModel, vmTemplate, K8S_OPS.PATCH),
      cta: (): void => {
        createModal(({ isOpen, onClose }) => (
          <LabelsModal
            isOpen={isOpen}
            obj={vmTemplate}
            onClose={onClose}
            onLabelsSubmit={(labels) =>
              kubevirtK8sPatch({
                cluster,
                data: getLabelsDiffPatch(labels, getLabels(vmTemplate, {}), getLabels(vmTemplate)),
                model: VirtualMachineTemplateModel,
                resource: vmTemplate,
              })
            }
          />
        ));
      },
      id: 'edit-labels',
      label: t('Edit labels'),
    },
    {
      accessReview: asAccessReview(VirtualMachineTemplateModel, vmTemplate, K8S_OPS.DELETE),
      cta: (): void => {
        createModal(({ isOpen, onClose }) => (
          <DeleteModal
            headerText={t('Delete VirtualMachine template?')}
            isOpen={isOpen}
            obj={vmTemplate}
            onClose={onClose}
            onDeleteSubmit={() =>
              kubevirtK8sDelete({
                cluster,
                model: VirtualMachineTemplateModel,
                resource: vmTemplate,
              })
            }
            shouldRedirect={false}
          />
        ));
      },
      id: 'delete-vm-template',
      label: t('Delete'),
    },
  ];

  return <ActionsDropdown actions={actions} isKebabToggle={isKebabToggle} />;
};

export default VirtualMachineTemplateActions;
