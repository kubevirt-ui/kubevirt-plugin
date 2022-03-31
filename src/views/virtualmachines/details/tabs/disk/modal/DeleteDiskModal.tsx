import * as React from 'react';
import produce from 'immer';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeleteResourceMessage from '@kubevirt-utils/components/DeleteResourceMessage/DeleteResourceMessage';
import { getRemoveHotplugPromise } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { buildOwnerReference, compareOwnerReferences } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { k8sDelete, K8sResourceCommon, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Checkbox, Stack, StackItem } from '@patternfly/react-core';

import useVolumeOwnedResource from './hooks/useVolumeOwnedResource';

type DeleteDiskModalProps = {
  vm: V1VirtualMachine;
  volume: V1Volume;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteDiskModal: React.FC<DeleteDiskModalProps> = ({ vm, volume, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  const [deleteOwnedResource, setDeleteOwnedResource] = React.useState(true);

  const diskName = volume?.name;

  const { volumeResource, loaded, volumeResourceName, volumeResourceModel } =
    useVolumeOwnedResource(vm, volume);

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedDisks = getDisks(vm)?.filter(({ name }) => name !== diskName);
    const updatedVolumes = getVolumes(vm)?.filter(({ name }) => name !== diskName);
    const updatedDataVolumeTemplates = getDataVolumeTemplates(vm)?.filter(
      (dvt) => dvt?.metadata?.name !== volumeResourceName,
    );

    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      vmDraft.spec.template.spec.domain.devices.disks = updatedDisks;
      vmDraft.spec.template.spec.volumes = updatedVolumes;
      vmDraft.spec.dataVolumeTemplates = updatedDataVolumeTemplates;
    });
    return updatedVM;
  }, [vm, diskName, volumeResourceName]);

  const onSubmit = (updatedVM: K8sResourceCommon) => {
    const promise =
      vm?.status?.printableStatus === printableVMStatus.Running
        ? getRemoveHotplugPromise(vm, diskName)
        : k8sUpdate({
            model: VirtualMachineModel,
            data: updatedVM,
            ns: updatedVM?.metadata?.namespace,
            name: updatedVM?.metadata?.name,
          });
    return promise.then(() => {
      if (volumeResource) {
        if (deleteOwnedResource) {
          // we need to delete the owned resource
          return k8sDelete({
            model: volumeResourceModel,
            resource: volumeResource,
            json: undefined,
            requestInit: undefined,
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
          model: volumeResourceModel,
          data: updatedResourceVolume,
          ns: updatedResourceVolume?.metadata?.namespace,
          name: updatedResourceVolume?.metadata?.name,
        });
      }
    });
  };

  return (
    <TabModal<K8sResourceCommon>
      onClose={onClose}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onSubmit={onSubmit}
      headerText={t('Delete {{diskName}} disk', { diskName })}
      submitBtnText={t('Delete')}
      submitBtnVariant={ButtonVariant.danger}
    >
      <Stack hasGutter>
        <StackItem>
          <DeleteResourceMessage
            obj={{
              metadata: { name: diskName, namespace: updatedVirtualMachine?.metadata?.namespace },
            }}
          />
        </StackItem>
        {loaded ? (
          <StackItem>
            {volumeResource && (
              <Checkbox
                id="delete-owned-resource"
                label={t('Delete {{volumeResourceName}} {{modelLabel}}', {
                  volumeResourceName,
                  modelLabel:
                    volumeResourceModel === DataVolumeModel
                      ? `${volumeResourceModel.label} and PVC`
                      : volumeResourceModel.label,
                })}
                isChecked={deleteOwnedResource}
                onChange={setDeleteOwnedResource}
              />
            )}
          </StackItem>
        ) : (
          <Loading />
        )}
      </Stack>
    </TabModal>
  );
};

export default DeleteDiskModal;
