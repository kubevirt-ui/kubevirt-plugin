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
  Text,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import TolerationsModal from './TolerationsModal';

const Tolerations: React.FC<TemplateSchedulingGridProps> = ({ template, editable, onSubmit }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const tolerationsCount = t('{{count}} Toleration rules', {
    count: getTolerations(template)?.length ?? 0,
  });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <TolerationsModal template={template} isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Tolerations')}</DescriptionListTerm>
      <DescriptionListDescription>
        {editable ? (
          <Button
            type="button"
            isInline
            onClick={onEditClick}
            variant="link"
            data-test-id="tolerations"
          >
            {tolerationsCount}
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
          </Button>
        ) : (
          <Text className="text-muted">{tolerationsCount}</Text>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Tolerations;
