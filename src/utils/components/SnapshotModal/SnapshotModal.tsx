import React, { FC, useMemo, useState } from 'react';

import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import {
  V1alpha1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { getVolumeSnapshotStatuses } from '@kubevirt-utils/resources/vm';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextArea, TextInput } from '@patternfly/react-core';

import { deadlineUnits } from '../../../views/virtualmachines/details/tabs/snapshots/utils/consts';
import {
  getEmptyVMSnapshotResource,
  getVolumeSnapshotStatusesPartition,
} from '../../../views/virtualmachines/details/tabs/snapshots/utils/helpers';
import { printableVMStatus } from '../../../views/virtualmachines/utils';

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
  const [snapshotName, setSnapshotName] = useState<string>(generatePrettyName('snapshot'));
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
    <TabModal<V1alpha1VirtualMachineSnapshot>
      onSubmit={(obj) =>
        k8sCreate<V1alpha1VirtualMachineSnapshot>({
          data: obj,
          model: VirtualMachineSnapshotModel,
        })
      }
      headerText={t('Take snapshot')}
      isDisabled={isSubmitDisabled}
      isOpen={isOpen}
      obj={resultSnapshot}
      onClose={onClose}
    >
      {
        <Form>
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
        </Form>
      }
    </TabModal>
  );
};

export default SnapshotModal;
