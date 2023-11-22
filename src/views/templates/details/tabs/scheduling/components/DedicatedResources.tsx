import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { isDedicatedCPUPlacement } from 'src/views/templates/utils/utils';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import DedicatedResourcesModal from './DedicatedResourcesModal';

const DedicatedResources: React.FC<TemplateSchedulingGridProps> = ({
  editable,
  onSubmit,
  template,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const dedicatedResourcesText = isDedicatedCPUPlacement(template)
    ? t('Workload scheduled with dedicated resources (guaranteed policy)')
    : t('No dedicated resources applied');

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <DedicatedResourcesModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        template={template}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Dedicated resources')}</DescriptionListTerm>
      <DescriptionListDescription>
        <Button
          data-test-id="dedicated-resources"
          isDisabled={!editable}
          isInline
          onClick={onEditClick}
          type="button"
          variant="link"
        >
          {dedicatedResourcesText}
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </Button>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default DedicatedResources;
