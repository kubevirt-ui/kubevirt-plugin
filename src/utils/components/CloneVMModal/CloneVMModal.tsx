import { type FC, useMemo, useState } from 'react';
import { type Resolver, useForm, useWatch } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import {
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
import { WatchedResourceKeyPrefix } from '@kubevirt-utils/hooks/useInFlightToast/features/watchedResources/types/types';
import { getWatchedResourcesActions } from '@kubevirt-utils/hooks/useInFlightToast/shared/selectors/inFlightToastStoreSelectors';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { createVMNameSchema } from '@kubevirt-utils/utils/createVMNameSchema';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { truncateToK8sName } from '@kubevirt-utils/utils/utils';
import * as yup from '@kubevirt-utils/yup';
import { getCluster } from '@multicluster/helpers/selectors';
import { Divider, ModalVariant } from '@patternfly/react-core';

import CloneVMModalConfigSection from './components/CloneVMModalConfigSection';
import DescriptionInput from './components/DescriptionInput';
import NameInput from './components/NameInput';
import SnapshotContentConfigurationSummary from './components/SnapshotContentConfigurationSummary';
import StartClonedVMCheckbox from './components/StartClonedVMCheckbox/StartClonedVMCheckbox';
import { getFailedCloneToastOptions, getToastWatchResourceData } from './utils/cloneWatchedToast';
import getSubmitBtnText from './utils/getSubmitBtnText';
import { cloneVM, generateName, vmExists } from './utils/helpers';

type CloneVMModalProps = {
  headerText?: string;
  isOpen: boolean;
  onClose: () => void;
  source: V1beta1VirtualMachineSnapshot | V1VirtualMachine;
};

type CloneNameFormValues = {
  name: string;
};

const CloneVMModal: FC<CloneVMModalProps> = ({ headerText, isOpen, onClose, source }) => {
  const { t } = useKubevirtTranslation();
  const namespace = getNamespace(source);
  const name = getName(source);

  const schema = useMemo(() => yup.object({ name: createVMNameSchema(t) }), [t]);

  const {
    control,
    formState: { errors, isValid },
  } = useForm<CloneNameFormValues>({
    defaultValues: { name: truncateToK8sName(isVM(source) ? `${name}-clone` : name) },
    mode: 'onChange',
    resolver: yupResolver(schema) as Resolver<CloneNameFormValues>,
  });

  const cloneName = useWatch({ control, name: 'name' });

  const [cloneDescription, setCloneDescription] = useState('');
  const [startCloneVM, setStartCloneVM] = useState(false);

  const handleSendCloneRequest = async (cluster: string | undefined): Promise<void> => {
    const metadataName = generateName(cloneName);
    const actions = getWatchedResourcesActions();
    const id = actions.pushNewWatchedResource(
      getToastWatchResourceData({
        cluster,
        metadataName,
        namespace,
        t,
        targetVmName: cloneName,
        title: `${t('Clone virtual machine')} - ${cloneName}`,
      }),
      WatchedResourceKeyPrefix.CloneVm,
    );

    try {
      await cloneVM({
        description: cloneDescription,
        metadataName,
        namespace,
        source,
        startVM: startCloneVM,
        targetName: cloneName,
      });
      logVMCloned({ status: TELEMETRY_STATUS.SUCCESS });
      if (isVM(source)) {
        logVMActionPerformed(TELEMETRY_VM_ACTION.CLONE, source);
      }
    } catch (error) {
      logVMCloned({ status: TELEMETRY_STATUS.FAILURE });
      actions.updateWatchedResourceToastOptions(id, getFailedCloneToastOptions(error));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    const cluster = getCluster(source);
    const vmSameName = await vmExists(cloneName, namespace, cluster);

    if (vmSameName) {
      throw new Error(t('VirtualMachine with this name already exists'));
    }

    await handleSendCloneRequest(cluster);
    onClose();
  };

  return (
    <TabModal
      cancelBtnText={t('Close')}
      closeOnSubmit={false}
      headerText={headerText ?? t('Clone {{sourceKind}}', { sourceKind: source.kind })}
      isDisabled={!isValid}
      isHorizontal
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={source}
      onClose={onClose}
      onSubmit={handleSubmit}
      shouldWrapInForm
      submitBtnText={getSubmitBtnText(false, isVM(source), t)}
    >
      <NameInput autoFocus control={control} errorMessage={errors.name?.message} />

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
