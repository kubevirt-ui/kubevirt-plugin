import { type FC, useMemo } from 'react';
import { type Resolver, useForm } from 'react-hook-form';

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
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { getCluster } from '@multicluster/helpers/selectors';
import { Divider, ModalVariant } from '@patternfly/react-core';

import CloneVMModalConfigSection from './components/CloneVMModalConfigSection';
import DescriptionInput from './components/DescriptionInput';
import NameInput from './components/NameInput';
import SnapshotContentConfigurationSummary from './components/SnapshotContentConfigurationSummary';
import StartClonedVMCheckbox from './components/StartClonedVMCheckbox/StartClonedVMCheckbox';
import { type CloneVMModalFormValues } from './types/types';
import { getFailedCloneToastOptions, getToastWatchResourceData } from './utils/cloneWatchedToast';
import getSubmitBtnText from './utils/getSubmitBtnText';
import { cloneVM, generateName, vmExists } from './utils/helpers';
import { getCloneVMSchema, getDefaultValues, getDescriptionPlaceholder } from './utils/utils';

type CloneVMModalProps = {
  headerText?: string;
  isOpen: boolean;
  onClose: () => void;
  source: V1beta1VirtualMachineSnapshot | V1VirtualMachine;
};

const CloneVMModal: FC<CloneVMModalProps> = ({ headerText, isOpen, onClose, source }) => {
  const { t } = useKubevirtTranslation();
  const namespace = getNamespace(source);

  const schema = useMemo(() => getCloneVMSchema(t), [t]);

  const {
    control,
    formState: { errors, isValid },
    getValues,
  } = useForm<CloneVMModalFormValues>({
    defaultValues: getDefaultValues(source),
    mode: 'onChange',
    resolver: yupResolver(schema) as Resolver<CloneVMModalFormValues>,
  });

  const handleSendCloneRequest = async (
    cluster: string | undefined,
    values: CloneVMModalFormValues,
  ): Promise<void> => {
    const metadataName = generateName(values.name);
    const actions = getWatchedResourcesActions();
    const id = actions.pushNewWatchedResource(
      getToastWatchResourceData({
        cluster,
        metadataName,
        namespace,
        t,
        targetVmName: values.name,
        title: `${t('Clone virtual machine')} - ${values.name}`,
      }),
      WatchedResourceKeyPrefix.CloneVm,
    );

    try {
      await cloneVM({
        description: values.description,
        metadataName,
        namespace,
        source,
        startVM: values.startCloneVM,
        targetName: values.name,
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
    const values = getValues();
    const cluster = getCluster(source);
    const vmSameName = await vmExists(values.name, namespace, cluster);

    if (vmSameName) {
      throw new Error(t('VirtualMachine with this name already exists'));
    }

    await handleSendCloneRequest(cluster, values);
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

      <DescriptionInput control={control} placeholder={getDescriptionPlaceholder(source, t)} />
      <StartClonedVMCheckbox control={control} />
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
