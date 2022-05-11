import React from 'react';
import { isDeschedulerOn } from 'src/views/templates/utils';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import DeschedulerModal from './DeschedulerModal';

type DeschedulerModalButtonProps = {
  template: V1Template;
  editable: boolean;
};

const DeschedulerModalButton: React.FC<DeschedulerModalButtonProps> = ({ template, editable }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();

  return (
    <Button
      isInline
      isDisabled={!editable}
      onClick={() =>
        createModal(({ isOpen, onClose }) => (
          <DeschedulerModal template={template} isOpen={isOpen} onClose={onClose} />
        ))
      }
      variant="link"
      iconPosition={'right'}
    >
      {isDeschedulerOn(template) ? t('ON') : t('OFF')}
      {editable && <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />}
    </Button>
  );
};
export default DeschedulerModalButton;
