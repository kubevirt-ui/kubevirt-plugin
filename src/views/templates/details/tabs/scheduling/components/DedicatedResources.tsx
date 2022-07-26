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
  Text,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import DedicatedResourcesModal from './DedicatedResourcesModal';

const DedicatedResources: React.FC<TemplateSchedulingGridProps> = ({
  template,
  editable,
  onSubmit,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const dedicatedResourcesText = isDedicatedCPUPlacement(template)
    ? t('Workload scheduled with dedicated resources (guaranteed policy)')
    : t('No Dedicated resources applied');

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <DedicatedResourcesModal
        template={template}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Dedicated resources')}</DescriptionListTerm>
      <DescriptionListDescription>
        {editable ? (
          <Button
            type="button"
            isInline
            onClick={onEditClick}
            variant="link"
            data-test-id="dedicated-resources"
          >
            {dedicatedResourcesText}
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
          </Button>
        ) : (
          <Text className="text-muted">{dedicatedResourcesText}</Text>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default DedicatedResources;
