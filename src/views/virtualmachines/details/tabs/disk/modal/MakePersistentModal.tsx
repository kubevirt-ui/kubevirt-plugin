import React, { FC, useMemo } from 'react';
import produce from 'immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { K8sResourceCommon, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

type MakePersistentModalProps = {
  vm: V1VirtualMachine;
  volume: V1Volume;
  isOpen: boolean;
  onClose: () => void;
};

const MakePersistentModal: FC<MakePersistentModalProps> = ({ vm, volume, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();

  const updatedVirtualMachine = useMemo(() => {
    return produce(vm, (draftVM) => {
      const volumes = [...getVolumes(vm)].map((machineVolume) => {
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
    <TabModal<K8sResourceCommon>
      onClose={onClose}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onSubmit={() =>
        k8sUpdate({
          model: VirtualMachineModel,
          data: updatedVirtualMachine,
          ns: updatedVirtualMachine?.metadata?.namespace,
          name: updatedVirtualMachine?.metadata?.name,
        })
      }
      headerText={t('Make persistent?')}
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
