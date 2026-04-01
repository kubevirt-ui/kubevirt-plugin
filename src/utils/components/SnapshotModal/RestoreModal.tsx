import React, { FC, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';

import { VirtualMachineRestoreModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1VirtualMachineRestore,
  V1beta1VirtualMachineSnapshot,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VolumeRestorePolicy } from '@kubevirt-utils/components/SnapshotModal/utils/constants';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { FormGroup, Radio, Stack, StackItem } from '@patternfly/react-core';

import { getVMRestoreSnapshotResource } from '../../../views/virtualmachines/details/tabs/snapshots/utils/helpers';

import './restore-modal.scss';

type RestoreModalProps = {
  isOpen: boolean;
  onClose: () => void;
  snapshot: V1beta1VirtualMachineSnapshot;
};

const RestoreModal: FC<RestoreModalProps> = ({ isOpen, onClose, snapshot }) => {
  const { t } = useKubevirtTranslation();
  const [volumeRestorePolicy, setVolumeRestorePolicy] = useState<VolumeRestorePolicy>(
    VolumeRestorePolicy.RandomizeNames,
  );

  const resultRestore = useMemo(() => {
    const restore: V1beta1VirtualMachineRestore = getVMRestoreSnapshotResource(snapshot);
    restore.spec.volumeRestorePolicy = volumeRestorePolicy;
    return restore;
  }, [snapshot, volumeRestorePolicy]);

  return (
    <TabModal<V1beta1VirtualMachineRestore>
      onSubmit={(obj) =>
        kubevirtK8sCreate({
          cluster: getCluster(snapshot),
          data: obj,
          model: VirtualMachineRestoreModel,
        })
      }
      headerText={t('Restore snapshot')}
      isOpen={isOpen}
      obj={resultRestore}
      onClose={onClose}
      shouldWrapInForm
      submitBtnText={t('Restore')}
    >
      <Stack hasGutter>
        <StackItem>
          <Trans t={t}>
            Are you sure you want to restore {{ vmName: snapshot?.spec?.source?.name }} from
            snapshot {{ snapshotName: snapshot.metadata.name }}?
            <div className="RestoreModal--note_text">
              <b>Note: </b>
              Data from the last snapshot taken will be lost. To prevent losing current data, take
              another snapshot before restoring from this one.
            </div>
          </Trans>
        </StackItem>
        <StackItem>
          <FormGroup
            fieldId="volume-restore-policy"
            isStack
            label={t('Volume restore policy')}
            role="radiogroup"
          >
            <Radio
              description={t('Restored volumes will receive randomized PVC names.')}
              id="randomize-names"
              isChecked={volumeRestorePolicy === VolumeRestorePolicy.RandomizeNames}
              label={t('Randomize names (default)')}
              name="volume-restore-policy"
              onChange={() => setVolumeRestorePolicy(VolumeRestorePolicy.RandomizeNames)}
            />
            <Radio
              description={t('Restored volumes will keep the original PVC names.')}
              id="in-place"
              isChecked={volumeRestorePolicy === VolumeRestorePolicy.InPlace}
              label={t('In place')}
              name="volume-restore-policy"
              onChange={() => setVolumeRestorePolicy(VolumeRestorePolicy.InPlace)}
            />
            <Radio
              description={t(
                'Restored volumes will use the target VM name as a prefix for PVC names.',
              )}
              id="prefix-target-name"
              isChecked={volumeRestorePolicy === VolumeRestorePolicy.PrefixTargetName}
              label={t('Prefix target name')}
              name="volume-restore-policy"
              onChange={() => setVolumeRestorePolicy(VolumeRestorePolicy.PrefixTargetName)}
            />
          </FormGroup>
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default RestoreModal;
