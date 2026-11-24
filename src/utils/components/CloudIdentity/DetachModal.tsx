import { type FC } from 'react';

import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal, { type TabModalResult } from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ButtonVariant, Content, Stack } from '@patternfly/react-core';

type DetachModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDetach: () => Promise<TabModalResult>;
  onDetached: () => void;
  serviceAccountName: string;
  showPendingChangesAlert?: boolean;
};

const DetachModal: FC<DetachModalProps> = ({
  isOpen,
  onClose,
  onDetach,
  onDetached,
  serviceAccountName,
  showPendingChangesAlert = false,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <TabModal
      headerText={t('Detach cloud identity?')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onDetach}
      onSuccess={onDetached}
      submitBtnText={t('Detach')}
      submitBtnVariant={ButtonVariant.danger}
    >
      <Stack hasGutter>
        {showPendingChangesAlert && <ModalPendingChangesAlert />}

        <Content component="p">
          {t(
            'Detach ServiceAccount {{serviceAccountName}} from this VirtualMachine? The ServiceAccount will not be deleted.',
            { serviceAccountName },
          )}
        </Content>
      </Stack>
    </TabModal>
  );
};

export default DetachModal;
