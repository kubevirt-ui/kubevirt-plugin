import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getAffinity } from 'src/views/templates/utils/selectors';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAffinityRules } from '@kubevirt-utils/resources/vmi';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import AffinityRulesModal from './AffinityRulesModal';

const AffinityRules: React.FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const rulesCount = t('{{count}} Affinity rules', {
    count: getAffinityRules(getAffinity(template))?.length ?? 0,
  });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <AffinityRulesModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        template={template}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Affinity rules')}</DescriptionListTerm>
      <DescriptionListDescription>
        <Button
          data-test-id="affinity-rules"
          isDisabled={!editable}
          isInline
          onClick={onEditClick}
          type="button"
          variant="link"
        >
          {rulesCount}
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </Button>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default AffinityRules;
