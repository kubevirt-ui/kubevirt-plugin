import * as React from 'react';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import {
  V1alpha1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { getVolumeSnapshotStatuses } from '@kubevirt-utils/resources/vm';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, Modal, TextArea } from '@patternfly/react-core';

import { deadlineUnits } from '../../utils/consts';
import {
  generateSnapshotName,
  getEmptyVMSnapshotResource,
  getVolumeSnapshotStatusesPartition,
} from '../../utils/helpers';

import CreateErrorAlert from './alerts/CreateErrorAlert';
import NoSupportedVolumesAlert from './alerts/NoSupportedVolumesAlert';
import SupportedVolumesAlert from './alerts/SupportedVolumesAlert';
import UnsupportedVolumesAlert from './alerts/UnsupportedVolumesAlert';
import SnapshotDeadlineFormField from './SnapshotFormFields/SnapshotDeadlineFormField';
import SnapshotNameFormField from './SnapshotFormFields/SnapshotNameFormField';
import SnapshotSupportedVolumeList from './SnapshotFormFields/SnapshotSupportedVolumeList';
import SnapshotModalFooter from './SnapshotModalFooter/SnapshotModalFooter';

type SnapshotModalProps = {
  vm: V1VirtualMachine;
  usedNames?: string[];
  isOpen: boolean;
  onClose: () => void;
};

const SnapshotModal: React.FC<SnapshotModalProps> = ({ vm, usedNames, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  // fields input values
  const [snapshotName, setSnapshotName] = React.useState<string>(generateSnapshotName(usedNames));
  const [description, setDescription] = React.useState<string>(undefined);
  const [deadline, setDeadline] = React.useState<string>(undefined);
  const [deadlineUnit, setDeadlineUnit] = React.useState<deadlineUnits>(deadlineUnits.Seconds);
  const [isCreating, setIsCreating] = React.useState<boolean>(false);

  const volumeSnapshotStatuses = getVolumeSnapshotStatuses(vm);
  const { supportedVolumes, unsupportedVolumes } =
    getVolumeSnapshotStatusesPartition(volumeSnapshotStatuses);

  const [isSubmitDisabled, setSubmitDisabled] = React.useState<boolean>(false);
  const [createSnapshotError, setCreateSnapshotError] = React.useState(undefined);

  const onSubmit = async () => {
    setIsCreating(true);
    const snapshot = getEmptyVMSnapshotResource(vm);
    const ownerReference = buildOwnerReference(vm);

    snapshot.metadata.name = snapshotName;
    snapshot.metadata.ownerReferences = [ownerReference];
    if (description) {
      snapshot.metadata.annotations = { description };
    }
    if (deadline) {
      snapshot.spec.failureDeadline = `${deadline}${deadlineUnit}`;
    }
    await k8sCreate<V1alpha1VirtualMachineSnapshot>({
      model: VirtualMachineSnapshotModel,
      data: snapshot,
    })
      .then(() => onClose())
      .catch((error) => setCreateSnapshotError(error))
      .finally(() => setIsCreating(false));
  };

  return (
    <Modal
      variant="small"
      position="top"
      className="ocs-modal co-catalog-page__overlay"
      header={<h1>{t('Add snapshot')}</h1>}
      footer={
        <SnapshotModalFooter
          onSubmit={onSubmit}
          onClose={onClose}
          isDisabled={isSubmitDisabled}
          isProcessing={isCreating}
        />
      }
      onClose={onClose}
      isOpen={isOpen}
    >
      {supportedVolumes?.length === 0 ? (
        <NoSupportedVolumesAlert />
      ) : (
        <Form>
          <SupportedVolumesAlert
            isVMRunning={vm?.status?.printableStatus === printableVMStatus.Running}
          />
          <SnapshotNameFormField
            snapshotName={snapshotName}
            setSnapshotName={setSnapshotName}
            usedNames={usedNames}
            setIsError={setSubmitDisabled}
          />
          <FormGroup label={t('Description')} fieldId="description">
            <TextArea value={description} onChange={setDescription} />
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
          <CreateErrorAlert createSnapshotError={createSnapshotError} />
        </Form>
      )}
    </Modal>
  );
};

export default SnapshotModal;
