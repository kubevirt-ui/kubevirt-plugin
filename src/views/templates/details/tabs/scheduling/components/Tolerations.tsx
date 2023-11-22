import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getTolerations } from 'src/views/templates/utils/selectors';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import TolerationsModal from './TolerationsModal';

const Tolerations: React.FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const tolerationsCount = t('{{count}} Toleration rules', {
    count: getTolerations(template)?.length ?? 0,
  });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <TolerationsModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} template={template} />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Tolerations')}</DescriptionListTerm>
      <DescriptionListDescription>
        <Button
          data-test-id="tolerations"
          isDisabled={!editable}
          isInline
          onClick={onEditClick}
          type="button"
          variant="link"
        >
          {tolerationsCount}
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </Button>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Tolerations;
