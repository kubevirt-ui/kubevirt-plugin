import React, { FC, useMemo, useState } from 'react';

import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import {
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { generateSnapshotName } from '@kubevirt-utils/components/SnapshotModal/utils/utils';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { getVolumeSnapshotStatuses } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { FormGroup, TextArea, TextInput } from '@patternfly/react-core';
import { deadlineUnits } from '@virtualmachines/details/tabs/snapshots/utils/consts';
import {
  getEmptyVMSnapshotResource,
  getVolumeSnapshotStatusesPartition,
} from '@virtualmachines/details/tabs/snapshots/utils/helpers';
import { printableVMStatus } from '@virtualmachines/utils';

import SupportedVolumesAlert from './alerts/SupportedVolumesAlert';
import UnsupportedVolumesAlert from './alerts/UnsupportedVolumesAlert';
import SnapshotDeadlineFormField from './SnapshotFormFields/SnapshotDeadlineFormField';
import SnapshotSupportedVolumeList from './SnapshotFormFields/SnapshotSupportedVolumeList';

type SnapshotModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const SnapshotModal: FC<SnapshotModalProps> = ({ isOpen, onClose, vm }) => {
  const { t } = useKubevirtTranslation();
  const [snapshotName, setSnapshotName] = useState<string>(generateSnapshotName(vm));
  const [description, setDescription] = useState<string>(undefined);
  const [deadline, setDeadline] = useState<string>(undefined);
  const [deadlineUnit, setDeadlineUnit] = useState<deadlineUnits>(deadlineUnits.Seconds);

  const volumeSnapshotStatuses = getVolumeSnapshotStatuses(vm);
  const { supportedVolumes, unsupportedVolumes } =
    getVolumeSnapshotStatusesPartition(volumeSnapshotStatuses);

  const [isSubmitDisabled, setSubmitDisabled] = useState<boolean>(false);

  const resultSnapshot = useMemo(() => {
    const snapshot = getEmptyVMSnapshotResource(vm);
    const ownerReference = buildOwnerReference(vm, { blockOwnerDeletion: false });

    snapshot.metadata.name = snapshotName;
    snapshot.metadata.ownerReferences = [ownerReference];
    if (description) {
      snapshot.metadata.annotations = { description };
    }
    if (deadline) {
      snapshot.spec.failureDeadline = `${deadline}${deadlineUnit}`;
    }
    return snapshot;
  }, [deadline, deadlineUnit, description, snapshotName, vm]);

  return (
    <TabModal<V1beta1VirtualMachineSnapshot>
      onSubmit={(obj) =>
        kubevirtK8sCreate<V1beta1VirtualMachineSnapshot>({
          cluster: getCluster(vm),
          data: obj,
          model: VirtualMachineSnapshotModel,
        })
      }
      headerText={t('Take snapshot')}
      isDisabled={isSubmitDisabled}
      isOpen={isOpen}
      obj={resultSnapshot}
      onClose={onClose}
      shouldWrapInForm
    >
      <SupportedVolumesAlert
        isVMRunning={vm?.status?.printableStatus === printableVMStatus.Running}
      />
      <FormGroup fieldId="name" isRequired label={t('Name')}>
        <TextInput
          id="name"
          onChange={(_, newName: string) => setSnapshotName(newName)}
          type="text"
          value={snapshotName}
        />
      </FormGroup>
      <FormGroup fieldId="description" label={t('Description')}>
        <TextArea
          id="description"
          onChange={(_, newDescription: string) => setDescription(newDescription)}
          value={description}
        />
      </FormGroup>
      <SnapshotDeadlineFormField
        deadline={deadline}
        deadlineUnit={deadlineUnit}
        setDeadline={setDeadline}
        setDeadlineUnit={setDeadlineUnit}
        setIsError={setSubmitDisabled}
      />
      <SnapshotSupportedVolumeList supportedVolumes={supportedVolumes} />
      <UnsupportedVolumesAlert unsupportedVolumes={unsupportedVolumes} />
    </TabModal>
  );
};

export default SnapshotModal;
