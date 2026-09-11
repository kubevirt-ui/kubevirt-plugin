import React, { type FC } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { CONFIRM_ACTIONS } from '@kubevirt-utils/components/ConfirmActionMessage/constants';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIVolumes } from '@kubevirt-utils/resources/vmi';
import { Stack, StackItem } from '@patternfly/react-core';

import { updateDisks } from '../../../details/utils/utils';
import { persistVolume } from './utils';

type MakePersistentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
  volume: V1Volume;
};

const MakePersistentModal: FC<MakePersistentModalProps> = ({
  isOpen,
  onClose,
  vm,
  vmi,
  volume,
}) => {
  const { t } = useKubevirtTranslation();

  const makePersistent = async (): Promise<V1VirtualMachine> => {
    const volumeToPersist = getVMIVolumes(vmi)?.find(
      (vmiVolume) => vmiVolume.name === volume?.name,
    );

    const vmPersistent = await persistVolume(vm, vmi, volumeToPersist);

    return updateDisks(vmPersistent);
  };

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Make persistent?')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={makePersistent}
    >
      <Stack hasGutter>
        <StackItem>
          <ConfirmActionMessage
            action={CONFIRM_ACTIONS.makePersistent}
            obj={{
              metadata: { name: volume?.name },
            }}
          />
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default MakePersistentModal;
