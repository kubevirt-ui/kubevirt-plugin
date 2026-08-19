import React, { type FC, useState } from 'react';

import { VirtualMachineSnapshotModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1VirtualMachineSnapshot,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  generateSnapshot,
  generateSnapshotSuffix,
} from '@kubevirt-utils/components/SnapshotModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { addRandomSuffix } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { FormGroup, List, ListItem, Stack, StackItem, TextArea } from '@patternfly/react-core';
import { deadlineUnits } from '@virtualmachines/details/tabs/snapshots/utils/consts';
import { getVolumeSnapshotStatusesPartitionPerVM } from '@virtualmachines/details/tabs/snapshots/utils/helpers';

import TabModal from '../TabModal/TabModal';
import BulkUnsupportedVolumesAlert from './alerts/BulkUnsupportedVolumesAlert';
import { useSuffixValidation } from './hooks/useSuffixValidation';
import SnapshotDeadlineFormField from './SnapshotFormFields/SnapshotDeadlineFormField';
import SnapshotSuffixFormField from './SnapshotFormFields/SnapshotSuffixFormField';
import SnapshotSupportedVolumeList from './SnapshotFormFields/SnapshotSupportedVolumeList';

import './BulkSnapshotModal.scss';

type BulkSnapshotModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vms: V1VirtualMachine[];
};

const BulkSnapshotModal: FC<BulkSnapshotModalProps> = ({ isOpen, onClose, vms }) => {
  const { t } = useKubevirtTranslation();

  const [snapshotSuffix, setSnapshotSuffix] = useState<string>(() => generateSnapshotSuffix());
  const {
    isSuffixValid,
    isSuffixValidDNS1123Label,
    isSuffixValidLength,
    maxSuffixLength,
    maxVMNameLength,
  } = useSuffixValidation(vms, snapshotSuffix);

  const [description, setDescription] = useState<string>(undefined);
  const [deadline, setDeadline] = useState<string>(undefined);
  const [deadlineUnit, setDeadlineUnit] = useState<deadlineUnits>(deadlineUnits.Seconds);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(false);

  const { supportedVolumes, unsupportedVolumes } = getVolumeSnapshotStatusesPartitionPerVM(vms);

  const onSubmit = (): Promise<V1beta1VirtualMachineSnapshot[]> => {
    return Promise.all(
      vms.map((vm) => {
        const shortenVMName = getName(vm).substring(0, maxVMNameLength);
        const snapshotName = `${addRandomSuffix(shortenVMName)}-${snapshotSuffix}`;
        const snapshot = generateSnapshot(vm, snapshotName, description, deadline, deadlineUnit);

        return kubevirtK8sCreate<V1beta1VirtualMachineSnapshot>({
          cluster: getCluster(vm),
          data: snapshot,
          model: VirtualMachineSnapshotModel,
        });
      }),
    );
  };

  return (
    <TabModal
      headerText={t('Take snapshots')}
      isDisabled={isSubmitDisabled || !isSuffixValid}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
    >
      <SnapshotSuffixFormField
        isSuffixValid={isSuffixValid}
        isSuffixValidDNS1123Label={isSuffixValidDNS1123Label}
        isSuffixValidLength={isSuffixValidLength}
        maxSuffixLength={maxSuffixLength}
        setSnapshotSuffix={setSnapshotSuffix}
        snapshotSuffix={snapshotSuffix}
      />
      <FormGroup fieldId="description" label={t('Description')}>
        <TextArea
          id="description"
          onChange={(_event, newDescription: string) => setDescription(newDescription)}
          resizeOrientation="vertical"
          value={description}
        />
      </FormGroup>
      <SnapshotDeadlineFormField
        deadline={deadline}
        deadlineUnit={deadlineUnit}
        setDeadline={setDeadline}
        setDeadlineUnit={setDeadlineUnit}
        setIsError={setIsSubmitDisabled}
      />
      <SnapshotSupportedVolumeList volumesCount={Object.values(supportedVolumes).flat().length}>
        <Stack className="vm-disks-list" hasGutter>
          {Object.entries(supportedVolumes).map(([vmName, volumes]) => (
            <StackItem key={vmName}>
              <div>{vmName}</div>
              <List>
                {volumes?.map((vol) => (
                  <ListItem className="pf-v6-u-font-weight-bold" key={vol.name}>
                    {vol.name}
                  </ListItem>
                ))}
              </List>
            </StackItem>
          ))}
        </Stack>
      </SnapshotSupportedVolumeList>
      <BulkUnsupportedVolumesAlert unsupportedVolumes={unsupportedVolumes} />
    </TabModal>
  );
};

export default BulkSnapshotModal;
