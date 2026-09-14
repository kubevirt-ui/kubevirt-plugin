import React, { type FC } from 'react';
import produce from 'immer';
import { ANNOTATIONS } from 'src/views/templates/utils/constants';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDisplayName } from '@kubevirt-utils/resources/shared';
import { type Template, updateTemplate } from '@kubevirt-utils/resources/template';
import { ensurePath } from '@kubevirt-utils/utils/utils';

import { type TemplateDetailsGridProps } from '../TemplateDetailsPage';

import DisplayNameModal from './DisplayNameModal';

const DisplayName: FC<TemplateDetailsGridProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const displayName = getDisplayName(template);

  const updateDisplayName = (updatedDisplayName: string): Promise<Template> => {
    const updatedTemplate = produce<Template>(template, (templateDraft: Template) => {
      ensurePath(templateDraft, 'metadata.annotations');

      delete templateDraft.metadata.annotations[ANNOTATIONS.displayName];

      if (updatedDisplayName)
        templateDraft.metadata.annotations[ANNOTATIONS.displayName] = updatedDisplayName;

      return templateDraft;
    });

    return updateTemplate(updatedTemplate);
  };

  const onEditClick = (): void =>
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
      descriptionData={displayName ?? <MutedTextSpan text={t('No display name')} />}
      descriptionHeader={t('Display name')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default DisplayName;
