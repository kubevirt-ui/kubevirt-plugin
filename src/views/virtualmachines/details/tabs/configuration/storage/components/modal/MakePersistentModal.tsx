import React, { FC, useMemo } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { Stack, StackItem } from '@patternfly/react-core';

import { updateVolumes } from '../../../details/utils/utils';

type MakePersistentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
  volume: V1Volume;
};

const MakePersistentModal: FC<MakePersistentModalProps> = ({ isOpen, onClose, vm, volume }) => {
  const { t } = useKubevirtTranslation();

  const updatedVirtualMachine = useMemo(() => {
    return produce(vm, (draftVM) => {
      const volumes = [...getVolumes(draftVM)].map((machineVolume) => {
        if (machineVolume?.name === volume?.name) {
          if (machineVolume?.dataVolume?.hotpluggable)
            delete machineVolume?.dataVolume?.hotpluggable;
          if (volume?.persistentVolumeClaim?.hotpluggable)
            delete machineVolume?.dataVolume?.hotpluggable;
        }

        return machineVolume;
      });

      draftVM.spec.template.spec.volumes = volumes;

      return draftVM;
    });
  }, [vm, volume]);

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Make persistent?')}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={updateVolumes}
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
