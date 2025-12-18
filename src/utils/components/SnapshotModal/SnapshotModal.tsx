import React, { FC, useMemo, useState } from 'react';

import { VirtualMachineSnapshotModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  generateSnapshot,
  generateSnapshotName,
} from '@kubevirt-utils/components/SnapshotModal/utils/utils';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumeSnapshotStatuses } from '@kubevirt-utils/resources/vm';
import { getDNS1123LabelError, isDNS1123Label } from '@kubevirt-utils/utils/validation';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import {
  FormGroup,
  List,
  ListItem,
  TextArea,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { deadlineUnits } from '@virtualmachines/details/tabs/snapshots/utils/consts';
import { getVolumeSnapshotStatusesPartition } from '@virtualmachines/details/tabs/snapshots/utils/helpers';
import { printableVMStatus } from '@virtualmachines/utils';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';

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
  const isSnapshotNameValid = isDNS1123Label(snapshotName);
  const [description, setDescription] = useState<string>(undefined);
  const [deadline, setDeadline] = useState<string>(undefined);
  const [deadlineUnit, setDeadlineUnit] = useState<deadlineUnits>(deadlineUnits.Seconds);

  const volumeSnapshotStatuses = getVolumeSnapshotStatuses(vm);
  const { supportedVolumes, unsupportedVolumes } =
    getVolumeSnapshotStatusesPartition(volumeSnapshotStatuses);

  const [isSubmitDisabled, setSubmitDisabled] = useState<boolean>(false);

  const resultSnapshot = useMemo(
    () => generateSnapshot(vm, snapshotName, description, deadline, deadlineUnit),
    [deadline, deadlineUnit, description, snapshotName, vm],
  );

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
      isDisabled={isSubmitDisabled || !isSnapshotNameValid}
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
          validated={isSnapshotNameValid ? ValidatedOptions.default : ValidatedOptions.error}
          value={snapshotName}
        />
        {!isSnapshotNameValid && (
          <FormGroupHelperText validated={ValidatedOptions.error}>
            {getDNS1123LabelError(snapshotName)?.(t)}
          </FormGroupHelperText>
        )}
      </FormGroup>
      <FormGroup fieldId="description" label={t('Description')}>
        <TextArea
          id="description"
          onChange={(_, newDescription: string) => setDescription(newDescription)}
          resizeOrientation="vertical"
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
      <SnapshotSupportedVolumeList volumesCount={supportedVolumes?.length ?? 0}>
        <List>
          {supportedVolumes?.map((vol) => (
            <ListItem key={vol.name}>{vol.name}</ListItem>
          ))}
        </List>
      </SnapshotSupportedVolumeList>
      <UnsupportedVolumesAlert unsupportedVolumes={unsupportedVolumes} />
    </TabModal>
  );
};

export default SnapshotModal;
