import React, { FC, useEffect, useRef, useState } from 'react';
import { TFunction } from 'i18next';

import {
  V1beta1VirtualMachineClone,
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import BackgroundOperationAlert from '@kubevirt-utils/components/TabModal/BackgroundOperationAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import {
  TELEMETRY_STATUS,
  TELEMETRY_VM_ACTION,
} from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logVMActionPerformed } from '@kubevirt-utils/extensions/telemetry/vm-actions';
import { logVMCloned } from '@kubevirt-utils/extensions/telemetry/vm-storage';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useNameValidation } from '@kubevirt-utils/hooks/useNameValidation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Alert, AlertVariant, Divider, ModalVariant } from '@patternfly/react-core';

import CloneVMModalConfigSection from './components/CloneVMModalConfigSection';
import DescriptionInput from './components/DescriptionInput';
import NameInput from './components/NameInput';
import SnapshotContentConfigurationSummary from './components/SnapshotContentConfigurationSummary';
import StartClonedVMCheckbox from './components/StartClonedVMCheckbox/StartClonedVMCheckbox';
import useCloneVMModal from './hooks/useCloneVMModal';
import { CLONING_STATUSES, isClonePhaseFailed, isClonePhaseInProgress } from './utils/constants';
import { cloneVM, vmExists } from './utils/helpers';

const getSubmitBtnText = (
  isCloneSucceeded: boolean,
  isCloneLoading: boolean,
  isVMSource: boolean,
  t: TFunction,
) => {
  if (isCloneSucceeded) return t('Close');
  if (isCloneLoading) return t('Cloning');
  return isVMSource ? t('Clone') : t('Create');
};

type CloneVMModalProps = {
  headerText?: string;
  isOpen: boolean;
  onClose: () => void;
  source: V1beta1VirtualMachineSnapshot | V1VirtualMachine;
};

const CloneVMModal: FC<CloneVMModalProps> = ({ headerText, isOpen, onClose, source }) => {
  const { t } = useKubevirtTranslation();
  const namespace = getNamespace(source);
  const name = getName(source);

  const [cloneName, setCloneName] = useState(
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

  const onNameChange = (value: string) => {
    setCloneName(value);
  };

  const sendCloneRequest = async () => {
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

  const hasLoggedCloneSuccess = useRef(false);

  useEffect(() => {
    if (isCloneSucceeded && !hasLoggedCloneSuccess.current) {
      hasLoggedCloneSuccess.current = true;
      logVMCloned({ status: TELEMETRY_STATUS.SUCCESS });
      if (isVM(source)) {
        logVMActionPerformed(TELEMETRY_VM_ACTION.CLONE, source);
      }
    }
  }, [isCloneSucceeded, source]);

  return (
    <TabModal
      onSubmit={async () => {
        if (isCloneSucceeded) {
          onClose();
          return;
        }
        return sendCloneRequest();
      }}
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
      shouldWrapInForm
      submitBtnText={getSubmitBtnText(isCloneSucceeded, isCloneInProgress, isVM(source), t)}
    >
      <BackgroundOperationAlert
        description={t(
          'Cloning may take several minutes. You can close this dialog — the process will continue in the background. The cloned virtual machine may take some time to appear in the list.',
        )}
        isVisible={isCloneInProgress}
      />
      {isCloneFailed && (
        <Alert isInline title={t('Clone failed')} variant={AlertVariant.danger}>
          {cloneFailureMessage ||
            t(
              'The operation could not be completed. Please try again or contact your administrator.',
            )}
        </Alert>
      )}
      {isCloneSucceeded && (
        <Alert
          title={t(
            'Clone completed. The cloned virtual machine may take some time to appear in the list.',
          )}
          isInline
          variant={AlertVariant.success}
        />
      )}
      <NameInput
        autoFocus
        errorText={errorText}
        name={cloneName}
        setName={onNameChange}
        validated={validated}
      />
      <DescriptionInput
        placeholder={
          isVM(source)
            ? t('This is a cloned vm of {{name}}', { name })
            : t('This is a vm created from snapshot {{name}}', { name })
        }
        description={cloneDescription}
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
