import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineModel, {
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeleteResourceMessage from '@kubevirt-utils/components/DeleteResourceMessage/DeleteResourceMessage';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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

  const onDelete = (updatedVM: V1VirtualMachine) => {
    const deletePromise = () =>
      k8sDelete({
        model: VirtualMachineModel,
        resource: updatedVM,
        requestInit: null,
        json: null,
      }).then(() =>
        history.push(`/k8s/ns/${updatedVM?.metadata?.namespace}/${VirtualMachineModelRef}`),
      );

    if (!deleteOwnedResource) {
      const vmOwnerRef = buildOwnerReference(updatedVM);

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

      return k8sPatch({
        model: VirtualMachineModel,
        resource: updatedVM,
        data: [
          {
            op: 'replace',
            path: '/spec/dataVolumeTemplates',
            value: null,
          },
        ],
      })
        .then(() => Promise.all([...pvcPromises, ...dvPromises]))
        .then(deletePromise);
    }

    return deletePromise();
  };

  return (
    <TabModal<V1VirtualMachine>
      onClose={onClose}
      isOpen={isOpen}
      obj={vm}
      onSubmit={onDelete}
      headerText={t('Delete {{vmName}} VirtualMachine', { vmName: vm?.metadata?.name })}
      submitBtnText={t('Delete')}
      submitBtnVariant={ButtonVariant.danger}
    >
      <Stack hasGutter>
        <StackItem>
          <DeleteResourceMessage obj={vm} />
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
