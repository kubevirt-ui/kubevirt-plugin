import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ejectISOFromCDROM } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ButtonVariant } from '@patternfly/react-core';

import { updateDisks } from '../../../details/utils/utils';

type EjectCDROMModalProps = {
  cdromName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  source: string;
  vm: V1VirtualMachine;
};

const EjectCDROMModal: FC<EjectCDROMModalProps> = ({
  cdromName,
  isOpen,
  onClose,
  onSubmit,
  source,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const handleEject = () => {
    const updatedVM = ejectISOFromCDROM(vm, cdromName);

    if (onSubmit) {
      return onSubmit(updatedVM);
    }
    return updateDisks(updatedVM);
  };

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Eject ISO')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleEject}
      submitBtnText={t('Eject')}
      submitBtnVariant={ButtonVariant.primary}
    >
      <Trans t={t}>
        Are you sure you want to eject the mounted ISO <strong>{{ source }}</strong> from{' '}
        <strong>{{ cdromName }}</strong>
      </Trans>
    </TabModal>
  );
};

export default EjectCDROMModal;
