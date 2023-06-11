import React from 'react';
import { isDeschedulerOn } from 'src/views/templates/utils/utils';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import DeschedulerModal from './DeschedulerModal';

type DeschedulerModalButtonProps = {
  editable: boolean;
  template: V1Template;
};

const DeschedulerModalButton: React.FC<DeschedulerModalButtonProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();

  return (
    <Button
      onClick={() =>
        createModal(({ isOpen, onClose }) => (
          <DeschedulerModal isOpen={isOpen} onClose={onClose} template={template} />
        ))
      }
      iconPosition={'right'}
      isDisabled={!editable}
      isInline
      variant="link"
    >
      {isDeschedulerOn(template) ? t('ON') : t('OFF')}
      {editable && <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />}
    </Button>
  );
};
export default DeschedulerModalButton;
