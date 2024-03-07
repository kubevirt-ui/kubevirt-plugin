import { MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import produce from 'immer';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from 'src/views/clusteroverview/SettingsTab/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/utils/constants';

import { quickCreateVM } from '@catalog/utils/quick-create-vm';
import { isRHELTemplate } from '@catalog/utils/utils';
import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import {
  ProcessedTemplatesModel,
  SecretModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { updateCloudInitRHELSubscription } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import {
  addSecretToVM,
  applyCloudDriveCloudInitVolume,
} from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { getAnnotation, getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  getTemplateOS,
  getTemplateVirtualMachineObject,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { getMemoryCPU } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, useAccessReview, useK8sModels } from '@openshift-console/dynamic-plugin-sdk';

import { allRequiredParametersAreFulfilled, hasValidSource, uploadFiles } from '../utils';

import useCreateVMName from './useCreateVMName';
import { useDrawerContext } from './useDrawerContext';

const useCreateDrawerForm = (
  namespace: string,
  subscriptionData: RHELAutomaticSubscriptionData,
  authorizedSSHKey: string,
) => {
  const { tabsData, updateTabsData, updateVM } = useWizardVMContext();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys] = useKubevirtUserSettings('ssh');
  const { featureEnabled: autoUpdateEnabled } = useFeatures(AUTOMATIC_UPDATE_FEATURE_NAME);
  const { featureEnabled: isDisabledGuestSystemLogs } = useFeatures(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );

  const navigate = useNavigate();
  const {
    cdFile,
    diskFile,
    isBootSourceAvailable,
    sshDetails,
    storageClassName,
    storageClassRequired,
    template,
    uploadCDData,
    uploadDiskData,
    vm,
  } = useDrawerContext();

  const { nameField, onVMNameChange } = useCreateVMName();

  const [startVM, setStartVM] = useState(true);
  const [isQuickCreating, setIsQuickCreating] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [createError, setCreateError] = useState(undefined);
  const [models, modelsLoading] = useK8sModels();

  const [processedTemplateAccessReview] = useAccessReview({
    namespace,
    resource: ProcessedTemplatesModel.plural,
    verb: 'create',
  });

  const storageClassRequiredMissing = storageClassRequired && isEmpty(storageClassName);

  const onQuickCreate = async (e: MouseEvent) => {
    e.preventDefault();
    setIsQuickCreating(true);
    setCreateError(undefined);

    const templateToProcess = produce(template, (draftTemplate) => {
      const vmObject = getTemplateVirtualMachineObject(draftTemplate);

      if (vm?.spec?.template) {
        ensurePath(vmObject, [
          'spec.template.spec.domain.cpu',
          'spec.template.spec.domain.memory.guest',
        ]);

        const { cpu, memory } = getMemoryCPU(vm);
        vmObject.spec.template.spec.domain.cpu.cores = cpu?.cores;
        vmObject.spec.template.spec.domain.memory.guest = memory;

        const modifiedTemplateObjects = template?.objects?.map((obj) =>
          obj.kind === VirtualMachineModel.kind ? vmObject : obj,
        );

        draftTemplate.objects = modifiedTemplateObjects;

        if (sshDetails.sshSecretName && sshDetails?.applyKeyToProject) {
          updateAuthorizedSSHKeys({
            ...authorizedSSHKeys,
            [namespace]: tabsData.authorizedSSHKey,
          });
        }
      }
    });

    try {
      const quickCreatedVM = await quickCreateVM({
        models,
        overrides: {
          autoUpdateEnabled,
          isDisabledGuestSystemLogs,
          name: nameField,
          namespace,
          startVM,
          subscriptionData,
        },
        template: templateToProcess,
        uploadData: (processedTemplate) =>
          uploadFiles({
            cdFile,
            diskFile,
            updateTabsData,
            uploadCDData,
            uploadDiskData,
            vm: getTemplateVirtualMachineObject(processedTemplate),
          }),
      });
      setIsQuickCreating(false);
      navigate(getResourceUrl({ model: VirtualMachineModel, resource: quickCreatedVM }));
    } catch (error) {
      setCreateError(error);
    } finally {
      setIsQuickCreating(false);
    }
  };

  const onCustomize = async (e: MouseEvent) => {
    e.preventDefault();
    setIsCustomizing(true);
    setCreateError(undefined);

    try {
      const processedTemplate = await k8sCreate<V1Template>({
        data: { ...template, metadata: { ...template?.metadata, namespace } },
        model: ProcessedTemplatesModel,
        ns: namespace,
        queryParams: {
          dryRun: 'All',
        },
      });

      const vmObject = await uploadFiles({
        cdFile,
        diskFile,
        updateTabsData,
        uploadCDData,
        uploadDiskData,
        vm: getTemplateVirtualMachineObject(processedTemplate),
      });

      const updatedVM = produce(vmObject, (vmDraft) => {
        ensurePath(vmDraft, [
          'spec.template.spec.domain.cpu',
          'spec.template.spec.domain.memory.guest',
        ]);

        vmDraft.metadata.namespace = namespace;
        vmDraft.metadata.labels[LABEL_USED_TEMPLATE_NAME] = template.metadata.name;
        vmDraft.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = template.metadata.namespace;
        const { cpu, memory } = getMemoryCPU(vm);
        vmDraft.spec.template.spec.domain.cpu.cores = cpu?.cores;
        vmDraft.spec.template.spec.domain.memory.guest = memory;

        const updatedVolumes = applyCloudDriveCloudInitVolume(vmObject);
        vmDraft.spec.template.spec.volumes = isRHELTemplate(processedTemplate)
          ? updateCloudInitRHELSubscription(updatedVolumes, subscriptionData, autoUpdateEnabled)
          : updatedVolumes;
      });

      updateTabsData((tabsDataDraft) => {
        // additional objects
        tabsDataDraft.additionalObjects = processedTemplate.objects.filter((obj) =>
          !isEmpty(authorizedSSHKey)
            ? obj.kind !== VirtualMachineModel.kind && obj.kind !== SecretModel
            : obj.kind !== VirtualMachineModel.kind,
        );

        // overview
        ensurePath(tabsDataDraft, 'overview.templateMetadata');
        tabsDataDraft.overview.templateMetadata.name = template.metadata.name;
        tabsDataDraft.overview.templateMetadata.namespace = template.metadata.namespace;
        tabsDataDraft.overview.templateMetadata.osType = getTemplateOS(template);
        tabsDataDraft.overview.templateMetadata.displayName = getAnnotation(
          template,
          ANNOTATIONS.displayName,
        );
      });

      updateTabsData((currentTabsData) => {
        currentTabsData.authorizedSSHKey = sshDetails?.sshSecretName;
        currentTabsData.applySSHToSettings = sshDetails?.applyKeyToProject;
      });

      // update context vm
      await updateVM(
        !isEmpty(authorizedSSHKey) ? addSecretToVM(updatedVM, authorizedSSHKey) : updatedVM,
      );

      navigate(`/k8s/ns/${namespace}/catalog/template/review`);
    } catch (error) {
      setCreateError(error);
    }
    setIsCustomizing(false);
  };

  const onChangeStartVM = (checked: boolean) => {
    setStartVM(checked);
    updateTabsData((currentTabsData) => {
      return { ...currentTabsData, startVM: checked };
    });
  };

  return {
    createError,
    isCustomizeDisabled: !processedTemplateAccessReview || isCustomizing,
    isCustomizeLoading: isCustomizing || modelsLoading,
    isQuickCreateDisabled:
      !isBootSourceAvailable ||
      isQuickCreating ||
      !nameField ||
      isEmpty(models) ||
      !allRequiredParametersAreFulfilled(template) ||
      !hasValidSource(template) ||
      storageClassRequiredMissing,
    isQuickCreateLoading: isQuickCreating || modelsLoading,
    nameField,
    onChangeStartVM,
    onCustomize,
    onQuickCreate,
    onVMNameChange,
    startVM,
  };
};

export default useCreateDrawerForm;
