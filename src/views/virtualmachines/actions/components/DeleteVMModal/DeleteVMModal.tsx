import * as React from 'react';
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
import useDeleteVMResources from './hooks/useDeleteVMResources';

type DeleteVMModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteVMModal: React.FC<DeleteVMModalProps> = ({ vm, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [deleteOwnedResource, setDeleteOwnedResource] = React.useState(true);
  const { dataVolumes, pvcs, snapshots, loaded } = useDeleteVMResources(vm);
  const [lastNamespacePath] = useLastNamespacePath();

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
