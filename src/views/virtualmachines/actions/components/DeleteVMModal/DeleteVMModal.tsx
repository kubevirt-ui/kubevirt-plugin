import React, { FC, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { GracePeriodInput } from '@kubevirt-utils/components/GracePeriodInput/GracePeriodInput';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getShareableVolumes } from '@kubevirt-utils/resources/vm';
import { KUBEVIRT_VM_PATH } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { getVMListURL, isACMPath } from '@multicluster/urls';
import { ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { deselectVM, isVMSelected } from '@virtualmachines/list/selectedVMs';

import DeleteOwnedResourcesMessage from './components/DeleteOwnedResourcesMessage';
import useDeleteVMResources from './hooks/useDeleteVMResources';
import useResourceSelection from './hooks/useResourceSelection';
import { deleteVMWithResources } from './utils/deleteVM';
import { DEFAULT_GRACE_PERIOD } from './constants';

type DeleteVMModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const DeleteVMModal: FC<DeleteVMModalProps> = ({ isOpen, onClose, vm }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [hubClusterName] = useHubClusterName();

  const [gracePeriodCheckbox, setGracePeriodCheckbox] = useState(false);
  const [gracePeriodSeconds, setGracePeriodSeconds] = useState(
    vm?.spec?.template?.spec?.terminationGracePeriodSeconds ?? DEFAULT_GRACE_PERIOD,
  );

  const { error, loaded, secrets, snapshots, volumes } = useDeleteVMResources(vm);
  const shareableVolumes = useMemo(() => getShareableVolumes(vm), [vm]);
  const { shouldSaveResource, toggleResource } = useResourceSelection(shareableVolumes);

  const onDelete = async (updatedVM: V1VirtualMachine) => {
    await deleteVMWithResources({
      gracePeriodOptions: gracePeriodCheckbox
        ? { apiVersion: 'v1', gracePeriodSeconds, kind: 'DeleteOptions' }
        : null,
      secrets,
      snapshotsToSave: snapshots.filter(shouldSaveResource),
      vm: updatedVM,
      volumesToSave: volumes.filter(shouldSaveResource),
    });

    if (isVMSelected(updatedVM)) deselectVM(updatedVM);

    if (!location.pathname.endsWith('/search') && !location.pathname.endsWith(KUBEVIRT_VM_PATH)) {
      const cluster = getCluster(vm) ?? hubClusterName;
      const clusterParam = isACMPath(location.pathname) ? cluster : null;
      const vmListURL = getVMListURL(clusterParam, getNamespace(vm));
      navigate(`${vmListURL}${location.search}${location.hash}`);
    }
  };

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Delete VirtualMachine?')}
      isOpen={isOpen}
      modalError={error}
      obj={vm}
      onClose={onClose}
      onSubmit={onDelete}
      submitBtnText={t('Delete')}
      submitBtnVariant={ButtonVariant.danger}
      titleIconVariant="warning"
    >
      <Stack hasGutter>
        <StackItem>
          <ConfirmActionMessage obj={vm} />
        </StackItem>
        <GracePeriodInput
          gracePeriodSeconds={gracePeriodSeconds}
          isChecked={gracePeriodCheckbox}
          onCheckboxChange={setGracePeriodCheckbox}
          setGracePeriodSeconds={setGracePeriodSeconds}
        />
        <DeleteOwnedResourcesMessage
          loaded={loaded}
          onToggle={toggleResource}
          shareableVolumes={shareableVolumes}
          shouldSaveResource={shouldSaveResource}
          snapshots={snapshots}
          volumes={volumes}
        />
      </Stack>
    </TabModal>
  );
};

export default DeleteVMModal;
