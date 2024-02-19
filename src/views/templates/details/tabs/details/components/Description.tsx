import * as React from 'react';
import produce from 'immer';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { TemplateDetailsGridProps } from '../TemplateDetailsPage';

const Description: React.FC<TemplateDetailsGridProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const templateDescription = template?.metadata?.annotations?.description || (
    <MutedTextSpan text={t('None')} />
  );

  const updateDescription = (updatedDescription: string) => {
    const updatedTemplate = produce<V1Template>(template, (templateDraft: V1Template) => {
      if (!templateDraft.metadata.annotations) templateDraft.metadata.annotations = {};

      if (updatedDescription) {
        templateDraft.metadata.annotations.description = updatedDescription;
      } else {
        delete templateDraft.metadata.annotations.description;
      }
      return templateDraft;
    });

    return k8sUpdate({
      data: updatedTemplate,
      model: TemplateModel,
      name: updatedTemplate?.metadata?.name,
      ns: updatedTemplate?.metadata?.namespace,
    });
  };

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <DescriptionModal
        isOpen={isOpen}
        obj={template}
        onClose={onClose}
        onSubmit={updateDescription}
      />
    ));

  return (
    <VirtualMachineDescriptionItem
      descriptionData={templateDescription}
      descriptionHeader={t('Description')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default Description;
