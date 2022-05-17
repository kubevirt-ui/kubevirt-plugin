import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getEvictionStrategy } from 'src/views/templates/utils/selectors';

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

import EvictionStrategyModal from './EvictionStrategyModal';

const EvictionStrategy: React.FC<TemplateSchedulingGridProps> = ({
  template,
  editable,
  onSubmit,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const strategy = getEvictionStrategy(template) || t('No eviction strategy');

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <EvictionStrategyModal
        template={template}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Eviction strategy')}</DescriptionListTerm>
      <DescriptionListDescription>
        {editable ? (
          <Button type="button" isInline onClick={onEditClick} variant="link">
            {strategy}
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
          </Button>
        ) : (
          <Text className="text-muted">{strategy}</Text>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default EvictionStrategy;
