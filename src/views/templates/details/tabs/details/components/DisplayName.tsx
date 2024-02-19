import * as React from 'react';
import produce from 'immer';
import { ANNOTATIONS } from 'src/views/templates/utils/constants';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { TemplateDetailsGridProps } from '../TemplateDetailsPage';

import DisplayNameModal from './DisplayNameModal';

const DisplayName: React.FC<TemplateDetailsGridProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const displayName = template?.metadata?.annotations?.[ANNOTATIONS.displayName];

  const updateDisplayName = (updatedDisplayName: string) => {
    const updatedTemplate = produce<V1Template>(template, (templateDraft: V1Template) => {
      if (!templateDraft.metadata.annotations) ensurePath(templateDraft, 'metadata.annotations');

      delete templateDraft.metadata.annotations[ANNOTATIONS.displayName];

      if (updatedDisplayName)
        templateDraft.metadata.annotations[ANNOTATIONS.displayName] = updatedDisplayName;

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
      <DisplayNameModal
        isOpen={isOpen}
        obj={template}
        onClose={onClose}
        onSubmit={updateDisplayName}
      />
    ));

  return (
    <VirtualMachineDescriptionItem
      descriptionData={displayName || <MutedTextSpan text={t('No display name')} />}
      descriptionHeader={t('Display name')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default DisplayName;
