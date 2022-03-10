import * as React from 'react';

import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import {
  V1alpha1VirtualMachineSnapshot,
  // V1alpha1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { getVolumeSnapshotStatuses } from '@kubevirt-utils/resources/vm';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextArea } from '@patternfly/react-core';

import { printableVMStatus } from '../../../../../utils';
import { deadlineUnits } from '../../utils/consts';
import {
  generateSnapshotName,
  getEmptyVMSnapshotResource,
  getVolumeSnapshotStatusesPartition,
} from '../../utils/helpers';

import NoSupportedVolumesAlert from './alerts/NoSupportedVolumesAlert';
import SupportedVolumesAlert from './alerts/SupportedVolumesAlert';
import UnsupportedVolumesAlert from './alerts/UnsupportedVolumesAlert';
import SnapshotDeadlineFormField from './SnapshotFormFields/SnapshotDeadlineFormField';
import SnapshotNameFormField from './SnapshotFormFields/SnapshotNameFormField';
import SnapshotSupportedVolumeList from './SnapshotFormFields/SnapshotSupportedVolumeList';

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

  const volumeSnapshotStatuses = getVolumeSnapshotStatuses(vm);
  const { supportedVolumes, unsupportedVolumes } =
    getVolumeSnapshotStatusesPartition(volumeSnapshotStatuses);

  const [isSubmitDisabled, setSubmitDisabled] = React.useState<boolean>(false);

  const resultSnapshot = React.useMemo(() => {
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
      isOpen={isOpen}
      obj={resultSnapshot}
      onSubmit={(obj) =>
        k8sCreate<V1alpha1VirtualMachineSnapshot>({
          model: VirtualMachineSnapshotModel,
          data: obj,
        })
      }
      onClose={onClose}
      headerText={t('Add snapshot')}
      isDisabled={isSubmitDisabled}
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
            <TextArea value={description} onChange={setDescription} id="description" />
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
      )}
    </TabModal>
  );
};

export default SnapshotModal;
