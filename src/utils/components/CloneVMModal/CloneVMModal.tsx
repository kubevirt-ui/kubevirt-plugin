import { type FC, useMemo, useState } from 'react';

import {
  type V1beta1VirtualMachineSnapshot,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { logVMCloned, TELEMETRY_STATUS } from '@kubevirt-utils/extensions/telemetry';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useNameValidation } from '@kubevirt-utils/hooks/useNameValidation';
import { pushNewWatchedToast } from '@kubevirt-utils/hooks/useUploadProgressToast/watchedResources/utils/watchedResourceUtils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Divider, ModalVariant } from '@patternfly/react-core';

import CloneVMModalConfigSection from './components/CloneVMModalConfigSection';
import DescriptionInput from './components/DescriptionInput';
import NameInput from './components/NameInput';
import SnapshotContentConfigurationSummary from './components/SnapshotContentConfigurationSummary';
import StartClonedVMCheckbox from './components/StartClonedVMCheckbox/StartClonedVMCheckbox';
import { getFailedCloneToastOptions, getToastWatchResourceData } from './utils/cloneWatchedToast';
import { CLONE_IN_PROGRESS_CONTENT, CLONE_VM_TOAST_TITLE } from './utils/constants';
import getSubmitBtnText from './utils/getSubmitBtnText';
import { cloneVM, getMetadataName, vmExists } from './utils/helpers';

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

  const [cloneName, setCloneName] = useState(() =>
    truncateToK8sName(isVM(source) ? `${name}-clone` : name),
  );

  const {
    errorText,
    isValid: isCloneNameValid,
    validated,
  } = useNameValidation({ name: cloneName });

  const { addInfoToast } = useKubevirtToast();

  const [cloneDescription, setCloneDescription] = useState('');
  const [startCloneVM, setStartCloneVM] = useState(false);

  const title = useMemo(() => `${CLONE_VM_TOAST_TITLE} - ${cloneName}`, [cloneName]);

  const handleSendCloneRequest = async (cluster: string | undefined): Promise<void> => {
    const metadataName = getMetadataName(cloneName);
    const watchedToastData = getToastWatchResourceData({
      cluster,
      metadataName,
      namespace,
      t,
      title,
    });
    try {
      await cloneVM({
        description: cloneDescription,
        metadataName,
        namespace,
        source,
        startVM: startCloneVM,
        targetName: cloneName,
      });
      pushNewWatchedToast(watchedToastData);
      logVMCloned({ status: TELEMETRY_STATUS.SUCCESS });
    } catch (error) {
      logVMCloned({ status: TELEMETRY_STATUS.FAILURE });
      pushNewWatchedToast({
        ...watchedToastData,
        ...getFailedCloneToastOptions(t, title, watchedToastData, error),
      });
    }
  };

  const handleSubmit = async (): Promise<void> => {
    const cluster = getCluster(source);
    const vmSameName = await vmExists(cloneName, namespace, cluster);

    if (vmSameName) {
      throw new Error(t('VirtualMachine with this name already exists'));
    }

    addInfoToast({
      content: t(CLONE_IN_PROGRESS_CONTENT),
      title,
    });

    await handleSendCloneRequest(cluster);
    onClose();
  };

  return (
    <TabModal
      cancelBtnText={t('Close')}
      closeOnSubmit={false}
      headerText={headerText ?? t('Clone {{sourceKind}}', { sourceKind: source.kind })}
      isDisabled={!isCloneNameValid}
      isHorizontal
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={source}
      onClose={onClose}
      onSubmit={handleSubmit}
      shouldWrapInForm
      submitBtnText={getSubmitBtnText(false, isVM(source), t)}
    >
      <NameInput
        autoFocus
        errorText={errorText}
        name={cloneName}
        setName={setCloneName}
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
