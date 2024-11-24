import React, { FC } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { getVMIVolumes } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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

  const makePersistent = () => {
    const volumeToPersist = getVMIVolumes(vmi).find((vmiVolume) => vmiVolume.name === volume?.name);
    const vmHasVolume = getVolumes(vm).find((vmVolume) => vmVolume.name === volume?.name);

    if (vmHasVolume || isEmpty(volumeToPersist)) return Promise.resolve();

    const vmPersistent = persistVolume(vm, vmi, volumeToPersist);

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
            obj={{
              metadata: { name: volume?.name },
            }}
            action="make persistent"
          />
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default MakePersistentModal;
