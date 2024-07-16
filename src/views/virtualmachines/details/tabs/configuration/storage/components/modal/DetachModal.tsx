import React, { FC } from 'react';

import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import TabModal, { TabModalProps } from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type DetachModalProps = Omit<TabModalProps, 'children'> & { diskName: string };

const DetachModal: FC<DetachModalProps> = (props) => {
  const { t } = useKubevirtTranslation();
  return (
    <TabModal headerText={t('Detach disk?')} {...props}>
      <ConfirmActionMessage action="detach" obj={{ metadata: { name: props.diskName } }} />
    </TabModal>
  );
};

export default DetachModal;
