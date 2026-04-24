import React, { FCC } from 'react';

import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { CONFIRM_ACTIONS } from '@kubevirt-utils/components/ConfirmActionMessage/constants';
import TabModal, { TabModalProps } from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type DetachModalProps = Omit<TabModalProps, 'children'> & { diskName: string };

const DetachModal: FCC<DetachModalProps> = (props) => {
  const { t } = useKubevirtTranslation();
  return (
    <TabModal headerText={t('Detach disk?')} {...props}>
      <ConfirmActionMessage
        action={CONFIRM_ACTIONS.detach}
        obj={{ metadata: { name: props.diskName } }}
      />
    </TabModal>
  );
};

export default DetachModal;
