import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineModel, {
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { GracePeriodInput } from '@kubevirt-utils/components/GracePeriodInput/GracePeriodInput';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import { buildOwnerReference, compareOwnerReferences } from '@kubevirt-utils/resources/shared';
import { k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Stack, StackItem } from '@patternfly/react-core';

import DeleteOwnedResourcesMessage from './components/DeleteOwnedResourcesMessage';
import useDeleteVMResources from './hooks/useDeleteVMResources';
import { DEFAULT_GRACE_PERIOD } from './constants';

type DeleteVMModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const DeleteVMModal: FC<DeleteVMModalProps> = ({ isOpen, onClose, vm }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [deleteOwnedResource, setDeleteOwnedResource] = useState<boolean>(true);
  const [gracePeriodCheckbox, setGracePeriodCheckbox] = useState<boolean>(false);
  const [gracePeriodSeconds, setGracePeriodSeconds] = useState<number>(
    vm?.spec?.template?.spec?.terminationGracePeriodSeconds || DEFAULT_GRACE_PERIOD,
  );
  const { dataVolumes, loaded, pvcs, snapshots } = useDeleteVMResources(vm);
  const lastNamespacePath = useLastNamespacePath();

  const onDelete = async (updatedVM: V1VirtualMachine) => {
    if (!deleteOwnedResource) {
      const vmOwnerRef = buildOwnerReference(updatedVM);

      await k8sPatch({
        data: [
          {
            op: 'remove',
            path: '/spec/dataVolumeTemplates',
          },
        ],
        model: VirtualMachineModel,
        resource: updatedVM,
      });

      const pvcPromises = (pvcs || [])?.map((pvc) => {
        const pvcFilteredOwnerReference = pvc?.metadata?.ownerReferences?.filter(
          (pvcRef) => !compareOwnerReferences(pvcRef, vmOwnerRef),
        );
        return k8sPatch({
          data: [
            {
              op: 'replace',
              path: '/metadata/ownerReferences',
              value: pvcFilteredOwnerReference,
            },
          ],
          model: PersistentVolumeClaimModel,
          resource: pvc,
        });
      });

      const dvPromises = (dataVolumes || [])?.map((dv) => {
        const dvFilteredOwnerReference = dv?.metadata?.ownerReferences?.filter(
          (dvRef) => !compareOwnerReferences(dvRef, vmOwnerRef),
        );
        return k8sPatch({
          data: [
            {
              op: 'replace',
              path: '/metadata/ownerReferences',
              value: dvFilteredOwnerReference,
            },
          ],
          model: DataVolumeModel,
          resource: dv,
        });
      });

      await Promise.allSettled([...pvcPromises, ...dvPromises]);
    }

    await k8sDelete({
      json: gracePeriodCheckbox
        ? { apiVersion: 'v1', gracePeriodSeconds, kind: 'DeleteOptions' }
        : null,
      model: VirtualMachineModel,
      resource: updatedVM,
    });
    navigate(`/k8s/${lastNamespacePath}/${VirtualMachineModelRef}`);
  };

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Delete VirtualMachine?')}
      isOpen={isOpen}
      obj={vm}
      onClose={onClose}
      onSubmit={onDelete}
      submitBtnText={t('Delete')}
      submitBtnVariant={ButtonVariant.danger}
    >
      <Stack hasGutter>
        <StackItem>
          <ConfirmActionMessage obj={vm} />
        </StackItem>
        <GracePeriodInput
          gracePeriodSeconds={gracePeriodSeconds}
          isChecked={gracePeriodCheckbox}
          onCheckboxChange={setGracePeriodCheckbox}
          setGracePeriodSeconds={setGracePeriodSeconds}
        />
        <DeleteOwnedResourcesMessage
          dataVolumes={dataVolumes}
          deleteOwnedResource={deleteOwnedResource}
          loaded={loaded}
          pvcs={pvcs}
          setDeleteOwnedResource={setDeleteOwnedResource}
          snapshots={snapshots}
        />
      </Stack>
    </TabModal>
  );
};

export default DeleteVMModal;
