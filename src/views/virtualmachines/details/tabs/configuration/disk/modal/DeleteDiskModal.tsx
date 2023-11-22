import * as React from 'react';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import {
  getRemoveHotplugPromise,
  produceVMDisks,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { buildOwnerReference, compareOwnerReferences } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { k8sDelete, K8sResourceCommon, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Checkbox, Stack, StackItem } from '@patternfly/react-core';

import useVolumeOwnedResource from './hooks/useVolumeOwnedResource';

type DeleteDiskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
  volume: V1Volume;
};

const DeleteDiskModal: React.FC<DeleteDiskModalProps> = ({ isOpen, onClose, vm, volume }) => {
  const { t } = useKubevirtTranslation();
  const [deleteOwnedResource, setDeleteOwnedResource] = React.useState(false);

  const diskName = volume?.name;

  const {
    error: loadingError,
    loaded,
    volumeResource,
    volumeResourceModel,
    volumeResourceName,
  } = useVolumeOwnedResource(vm, volume);

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedDisks = (getDisks(vm) || [])?.filter(({ name }) => name !== diskName);
    const updatedVolumes = (getVolumes(vm) || [])?.filter(({ name }) => name !== diskName);
    const updatedDataVolumeTemplates = (getDataVolumeTemplates(vm) || [])?.filter(
      (dvt) => dvt?.metadata?.name !== volumeResourceName,
    );

    const updatedVM = produceVMDisks(vm, (vmDraft: V1VirtualMachine) => {
      vmDraft.spec.template.spec.domain.devices.disks = updatedDisks;
      vmDraft.spec.template.spec.volumes = updatedVolumes;
      vmDraft.spec.dataVolumeTemplates = updatedDataVolumeTemplates;
    });
    return updatedVM;
  }, [vm, diskName, volumeResourceName]);

  const onSubmit = (updatedVM: K8sResourceCommon) => {
    const deletePromise =
      vm?.status?.printableStatus === printableVMStatus.Running
        ? getRemoveHotplugPromise(vm, diskName)
        : k8sUpdate({
            data: updatedVM,
            model: VirtualMachineModel,
            name: updatedVM?.metadata?.name,
            ns: updatedVM?.metadata?.namespace,
          });

    return deletePromise.then(() => {
      if (volumeResource) {
        if (deleteOwnedResource) {
          // we need to delete the owned resource
          return k8sDelete({
            json: undefined,
            model: volumeResourceModel,
            requestInit: undefined,
            resource: volumeResource,
          });
        }
        // we don't need to delete the owned resource
        // so we remove the resource's ownerReference from the owned resource
        const vmOwnerRef = buildOwnerReference(updatedVM);
        const updatedVolumeOwnerReferences = volumeResource?.metadata?.ownerReferences?.filter(
          (ref) => {
            return !compareOwnerReferences(ref, vmOwnerRef);
          },
        );
        const updatedResourceVolume = { ...volumeResource };
        updatedResourceVolume.metadata.ownerReferences = updatedVolumeOwnerReferences;
        return k8sUpdate({
          data: updatedResourceVolume,
          model: volumeResourceModel,
          name: updatedResourceVolume?.metadata?.name,
          ns: updatedResourceVolume?.metadata?.namespace,
        });
      }
    });
  };

  return (
    <TabModal<K8sResourceCommon>
      headerText={t('Detach disk?')}
      isOpen={isOpen}
      modalError={loadingError}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
      submitBtnText={t('Detach')}
      submitBtnVariant={ButtonVariant.danger}
    >
      <Stack hasGutter>
        <StackItem>
          <ConfirmActionMessage
            obj={{
              metadata: { name: diskName, namespace: updatedVirtualMachine?.metadata?.namespace },
            }}
            action="detach"
          />
        </StackItem>
        {loaded && (
          <StackItem>
            {volumeResource && (
              <Checkbox
                label={t('Delete {{volumeResourceName}} {{modelLabel}}', {
                  modelLabel:
                    volumeResourceModel === DataVolumeModel
                      ? `${volumeResourceModel.label} and PVC`
                      : volumeResourceModel.label,
                  volumeResourceName,
                })}
                id="delete-owned-resource"
                isChecked={deleteOwnedResource}
                onChange={setDeleteOwnedResource}
              />
            )}
          </StackItem>
        )}

        {!loaded && !loadingError && <Loading />}
      </Stack>
    </TabModal>
  );
};

export default DeleteDiskModal;
