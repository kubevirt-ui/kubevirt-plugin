import React, { FC } from 'react';
import produce from 'immer';
import { ANNOTATIONS } from 'src/views/templates/utils/constants';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateTemplate } from '@kubevirt-utils/resources/template';
import { ensurePath } from '@kubevirt-utils/utils/utils';

import { TemplateDetailsGridProps } from '../TemplateDetailsPage';

import DisplayNameModal from './DisplayNameModal';

const DisplayName: FC<TemplateDetailsGridProps> = ({ editable, template }) => {
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

    return updateTemplate(updatedTemplate);
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
    <DescriptionItem
      descriptionData={displayName || <MutedTextSpan text={t('No display name')} />}
      descriptionHeader={t('Display name')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default DisplayName;
