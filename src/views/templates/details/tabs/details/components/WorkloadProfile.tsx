import React, { FC } from 'react';
import produce from 'immer';
import { getWorkloadProfile } from 'src/views/templates/utils/selectors';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateVirtualMachineObject,
  getTemplateWorkload,
  TEMPLATE_WORKLOAD_LABEL,
  updateTemplate,
  WORKLOADS,
} from '@kubevirt-utils/resources/template';
import { VM_WORKLOAD_ANNOTATION } from '@kubevirt-utils/resources/vm/utils';
import { ensurePath } from '@kubevirt-utils/utils/utils';

import { TemplateDetailsGridProps } from '../TemplateDetailsPage';

const WorkloadProfile: FC<TemplateDetailsGridProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const workload = getWorkloadProfile(template);

  const updateWorkload = (updatedWorkload: WORKLOADS) => {
    const updatedTemplate = produce(template, (draftTemplate) => {
      const draftVM = getTemplateVirtualMachineObject(draftTemplate);
      ensurePath(draftVM, ['spec.template.metadata.annotations']);
      draftVM.spec.template.metadata.annotations[VM_WORKLOAD_ANNOTATION] = updatedWorkload;

      const currentWorkload = getTemplateWorkload(template);
      if (currentWorkload) {
        delete draftTemplate.metadata.labels[`${TEMPLATE_WORKLOAD_LABEL}/${currentWorkload}`];
      }
      draftTemplate.metadata.labels[`${TEMPLATE_WORKLOAD_LABEL}/${updatedWorkload}`] = 'true';
    });

    return updateTemplate(updatedTemplate);
  };

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <WorkloadProfileModal
        initialWorkload={getTemplateWorkload(template) as WORKLOADS}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={updateWorkload}
      />
    ));

  return (
    <DescriptionItem
      descriptionData={workload}
      descriptionHeader={t('Workload profile')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default WorkloadProfile;
