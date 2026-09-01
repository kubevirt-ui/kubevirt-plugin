import React, { type FC, useEffect, useRef, useState } from 'react';

import {
  type V1beta1VirtualMachineClone,
  type V1beta1VirtualMachineSnapshot,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import {
  TELEMETRY_STATUS,
  TELEMETRY_VM_ACTION,
} from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logVMActionPerformed } from '@kubevirt-utils/extensions/telemetry/vm-actions';
import { logVMCloned } from '@kubevirt-utils/extensions/telemetry/vm-storage';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useNameValidation } from '@kubevirt-utils/hooks/useNameValidation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Divider, ModalVariant } from '@patternfly/react-core';

import CloneStatusAlerts from './components/CloneStatusAlerts';
import CloneVMModalConfigSection from './components/CloneVMModalConfigSection';
import DescriptionInput from './components/DescriptionInput';
import NameInput from './components/NameInput';
import SnapshotContentConfigurationSummary from './components/SnapshotContentConfigurationSummary';
import StartClonedVMCheckbox from './components/StartClonedVMCheckbox/StartClonedVMCheckbox';
import useCloneVMModal from './hooks/useCloneVMModal';
import { CLONING_STATUSES, isClonePhaseFailed, isClonePhaseInProgress } from './utils/constants';
import getSubmitBtnText from './utils/getSubmitBtnText';
import { cloneVM, vmExists } from './utils/helpers';

type CloneVMModalProps = {
  headerText?: string;
  isOpen: boolean;
  onClose: () => void;
  source: V1beta1VirtualMachineSnapshot | V1VirtualMachine;
};

const CloneVMModal: FC<CloneVMModalProps> = ({ headerText, isOpen, onClose, source }) => {
  const { t } = useKubevirtTranslation();
  const { addSuccessToast } = useKubevirtToast();
  const namespace = getNamespace(source);
  const name = getName(source);

  const [cloneName, setCloneName] = useState(() =>
    truncateToK8sName(isVM(source) ? `${name}-clone` : name),
  );

  const {
    errorText,
    isValid: isCloneNameValid,
    validated,
  } = useNameValidation({ name: cloneName });

  const [cloneDescription, setCloneDescription] = useState('');
  const [startCloneVM, setStartCloneVM] = useState(false);
  const [initialCloneRequest, setInitialCloneRequest] = useState<V1beta1VirtualMachineClone>();

  const onNameChange = (value: string): void => {
    setCloneName(value);
  };

  const sendCloneRequest = async (): Promise<void> => {
    const vmSameName = await vmExists(cloneName, namespace, getCluster(source));

    if (vmSameName) {
      throw new Error(t('VirtualMachine with this name already exists'));
    }

    const request = await cloneVM(source, cloneName, namespace, startCloneVM, cloneDescription);
    setInitialCloneRequest(request);
  };

  const cloneRequest = useCloneVMModal(
    getName(initialCloneRequest),
    getNamespace(initialCloneRequest),
    getCluster(initialCloneRequest),
  );

  const clonePhase = cloneRequest?.status?.phase;
  const isCloneSucceeded = clonePhase === CLONING_STATUSES.SUCCEEDED;
  const isCloneFailed = isClonePhaseFailed(clonePhase);
  const isCloneInProgress =
    Boolean(initialCloneRequest) &&
    !isCloneSucceeded &&
    !isCloneFailed &&
    isClonePhaseInProgress(clonePhase);
  const cloneFailureMessage = cloneRequest?.status?.conditions?.find(
    (condition) => condition.status === 'False',
  )?.message;

  const hasLoggedCloneSuccessRef = useRef(false);

  useEffect(() => {
    if (isCloneSucceeded && !hasLoggedCloneSuccessRef.current) {
      hasLoggedCloneSuccessRef.current = true;
      logVMCloned({ status: TELEMETRY_STATUS.SUCCESS });
      if (isVM(source)) {
        logVMActionPerformed(TELEMETRY_VM_ACTION.CLONE, source);
      }
      addSuccessToast({
        title: t(
          'Clone completed. The cloned virtual machine may take some time to appear in the list.',
        ),
      });
      onClose();
    }
  }, [addSuccessToast, isCloneSucceeded, onClose, source, t]);

  return (
    <TabModal
      cancelBtnText={initialCloneRequest ? t('Close') : undefined}
      closeOnSubmit={false}
      headerText={headerText ?? t('Clone {{sourceKind}}', { sourceKind: source.kind })}
      isDisabled={!isCloneNameValid || isCloneInProgress}
      isHorizontal
      isLoading={isCloneInProgress}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={source}
      onClose={onClose}
      onSubmit={sendCloneRequest}
      shouldWrapInForm
      submitBtnText={getSubmitBtnText(isCloneInProgress, isVM(source), t)}
    >
      <CloneStatusAlerts
        cloneFailureMessage={cloneFailureMessage}
        isCloneFailed={isCloneFailed}
        isCloneInProgress={isCloneInProgress}
      />
      <NameInput
        autoFocus
        errorText={errorText}
        name={cloneName}
        setName={onNameChange}
        validated={validated}
      />
      <DescriptionInput
        description={cloneDescription}
        placeholder={
          isVM(source)
            ? t('This is a cloned vm of {{name}}', { name })
            : t('This is a vm created from snapshot {{name}}', { name })
        }
        setDescription={setCloneDescription}
      />
      <StartClonedVMCheckbox setStartCloneVM={setStartCloneVM} startCloneVM={startCloneVM} />
      <Divider />
      {isVM(source) ? (
        <CloneVMModalConfigSection vm={source} />
      ) : (
        <SnapshotContentConfigurationSummary snapshot={source} />
      )}
    </TabModal>
  );
};

export default CloneVMModal;
