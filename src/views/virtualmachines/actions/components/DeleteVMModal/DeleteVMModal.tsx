import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineModel, {
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import { buildOwnerReference, compareOwnerReferences } from '@kubevirt-utils/resources/shared';
import { k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Stack, StackItem } from '@patternfly/react-core';

import DeleteOwnedResourcesMessage from './components/DeleteOwnedResourcesMessage';
import { GracePeriodInput } from './components/GracePeriodInput';
import useDeleteVMResources from './hooks/useDeleteVMResources';
import { DEFAULT_GRACE_PERIOD } from './constants';

type DeleteVMModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteVMModal: FC<DeleteVMModalProps> = ({ vm, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [deleteOwnedResource, setDeleteOwnedResource] = useState<boolean>(true);
  const [gracePeriodCheckbox, setGracePeriodCheckbox] = useState<boolean>(false);
  const [gracePeriodSeconds, setGracePeriodSeconds] = useState<number>(
    vm?.spec?.template?.spec?.terminationGracePeriodSeconds || DEFAULT_GRACE_PERIOD,
  );
  const { dataVolumes, pvcs, snapshots, loaded } = useDeleteVMResources(vm);
  const lastNamespacePath = useLastNamespacePath();

  const onDelete = async (updatedVM: V1VirtualMachine) => {
    if (!deleteOwnedResource) {
      const vmOwnerRef = buildOwnerReference(updatedVM);

      await k8sPatch({
        model: VirtualMachineModel,
        resource: updatedVM,
        data: [
          {
            op: 'remove',
            path: '/spec/dataVolumeTemplates',
          },
        ],
      });

      const pvcPromises = (pvcs || [])?.map((pvc) => {
        const pvcFilteredOwnerReference = pvc?.metadata?.ownerReferences?.filter(
          (pvcRef) => !compareOwnerReferences(pvcRef, vmOwnerRef),
        );
        return k8sPatch({
          model: PersistentVolumeClaimModel,
          resource: pvc,
          data: [
            {
              op: 'replace',
              path: '/metadata/ownerReferences',
              value: pvcFilteredOwnerReference,
            },
          ],
        });
      });

      const dvPromises = (dataVolumes || [])?.map((dv) => {
        const dvFilteredOwnerReference = dv?.metadata?.ownerReferences?.filter(
          (dvRef) => !compareOwnerReferences(dvRef, vmOwnerRef),
        );
        return k8sPatch({
          model: DataVolumeModel,
          resource: dv,
          data: [
            {
              op: 'replace',
              path: '/metadata/ownerReferences',
              value: dvFilteredOwnerReference,
            },
          ],
        });
      });

      await Promise.allSettled([...pvcPromises, ...dvPromises]);
    }

    await k8sDelete({
      model: VirtualMachineModel,
      resource: updatedVM,
      json: gracePeriodCheckbox
        ? { kind: 'DeleteOptions', apiVersion: 'v1', gracePeriodSeconds }
        : null,
    });
    history.push(`/k8s/${lastNamespacePath}/${VirtualMachineModelRef}`);
  };

  return (
    <TabModal<V1VirtualMachine>
      onClose={onClose}
      isOpen={isOpen}
      obj={vm}
      onSubmit={onDelete}
      headerText={t('Delete {{vmName}} VirtualMachine?', { vmName: vm?.metadata?.name })}
      submitBtnText={t('Delete')}
      submitBtnVariant={ButtonVariant.danger}
    >
      <Stack hasGutter>
        <StackItem>
          <ConfirmActionMessage obj={vm} />
        </StackItem>
        <GracePeriodInput
          isChecked={gracePeriodCheckbox}
          onCheckboxChange={setGracePeriodCheckbox}
          gracePeriodSeconds={gracePeriodSeconds}
          setGracePeriodSeconds={setGracePeriodSeconds}
        />
        <DeleteOwnedResourcesMessage
          deleteOwnedResource={deleteOwnedResource}
          setDeleteOwnedResource={setDeleteOwnedResource}
          dataVolumes={dataVolumes}
          pvcs={pvcs}
          snapshots={snapshots}
          loaded={loaded}
        />
      </Stack>
    </TabModal>
  );
};

export default DeleteVMModal;
