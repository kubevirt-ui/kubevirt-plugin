import * as React from 'react';
import produce from 'immer';
import { ANNOTATIONS } from 'src/views/templates/utils/constants';
import { ensurePath } from 'src/views/templates/utils/utils';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { TemplateDetailsGridProps } from '../TemplateDetailsPage';

import DisplayNameModal from './DisplayNameModal';

const DisplayName: React.FC<TemplateDetailsGridProps> = ({ template, editable }) => {
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
      model: TemplateModel,
      data: updatedTemplate,
      ns: updatedTemplate?.metadata?.namespace,
      name: updatedTemplate?.metadata?.name,
    });
  };

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <DisplayNameModal
        obj={template}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={updateDisplayName}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Display name')}</DescriptionListTerm>
      <DescriptionListDescription>
        {displayName || <MutedTextSpan text={t('No display name')} />}
        <Button type="button" isInline onClick={onEditClick} isDisabled={!editable} variant="link">
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </Button>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default DisplayName;
