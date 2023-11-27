import * as React from 'react';
import produce from 'immer';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
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
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
      <DescriptionListDescription>
        {templateDescription}
        <Button isDisabled={!editable} isInline onClick={onEditClick} type="button" variant="link">
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </Button>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Description;
