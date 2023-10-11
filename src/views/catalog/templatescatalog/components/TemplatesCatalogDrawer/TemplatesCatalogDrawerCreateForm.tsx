import React, { FC, memo, MouseEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import produce from 'immer';

import { NAME_INPUT_FIELD } from '@catalog/customize/constants';
import { isNameParameterExists, replaceTemplateParameterValue } from '@catalog/customize/utils';
import { quickCreateVM } from '@catalog/utils/quick-create-vm';
import { isRHELTemplate } from '@catalog/utils/utils';
import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import {
  ProcessedTemplatesModel,
  SecretModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1DataVolumeTemplateSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { updateCloudInitRHELSubscription } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import {
  addSecretToVM,
  applyCloudDriveCloudInitVolume,
} from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { getAnnotation, getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  getTemplateOS,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template';
import { TemplateBootSource } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getDataVolumeTemplates } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { useAccessReview, useK8sModels } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Checkbox,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  FormGroup,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';

import {
  applyCPUMemory,
  applyTemplateMetadataToVM,
  processTemplate,
  shouldApplyInitialStorageClass,
} from './utils/helpers';
import AuthorizedSSHKey from './AuthorizedSSHKey';

type TemplatesCatalogDrawerCreateFormProps = {
  authorizedSSHKey: string;
  canQuickCreate: boolean;
  initialVMName?: string;
  isBootSourceAvailable: boolean;
  namespace: string;
  onCancel: () => void;
  subscriptionData: RHELAutomaticSubscriptionData;
  template: V1Template;
  templateBootSource: TemplateBootSource;
};

export const TemplatesCatalogDrawerCreateForm: FC<TemplatesCatalogDrawerCreateFormProps> = memo(
  ({
    authorizedSSHKey,
    canQuickCreate,
    initialVMName,
    isBootSourceAvailable,
    namespace,
    onCancel,
    subscriptionData,
    template,
    templateBootSource,
  }) => {
    const history = useHistory();
    const { t } = useKubevirtTranslation();
    const { updateTabsData, updateVM, vm } = useWizardVMContext();

    const [vmName, setVMName] = useState(initialVMName || '');
    const [startVM, setStartVM] = useState(true);
    const [isQuickCreating, setIsQuickCreating] = useState(false);
    const [quickCreateError, setQuickCreateError] = useState(undefined);
    const [models, modelsLoading] = useK8sModels();

    const [processedTemplateAccessReview] = useAccessReview({
      namespace,
      resource: ProcessedTemplatesModel.plural,
      verb: 'create',
    });

    const onQuickCreate = async () => {
      setIsQuickCreating(true);
      setQuickCreateError(undefined);

      const templateToProcess = produce(template, (draftTemplate) => {
        if (isNameParameterExists(template)) {
          replaceTemplateParameterValue(draftTemplate, NAME_INPUT_FIELD, vmName);
        }

        if (!isEmpty(authorizedSSHKey)) {
          draftTemplate.objects = template.objects.filter((obj) => obj?.kind !== SecretModel.kind);
        }
      });

      try {
        const processedTemplate = await processTemplate(templateToProcess, namespace);

        const vmObject = getTemplateVirtualMachineObject(processedTemplate);

        const applyBootSourceStorageClass = await shouldApplyInitialStorageClass(vmObject);

        const overrideVM = produce(vmObject, (draftVM) => {
          draftVM.metadata.namespace = namespace;

          applyTemplateMetadataToVM(draftVM, template);
          applyCPUMemory(draftVM, vm);

          const updatedVolumes = applyCloudDriveCloudInitVolume(draftVM);
          draftVM.spec.template.spec.volumes = isRHELTemplate(processedTemplate)
            ? updateCloudInitRHELSubscription(updatedVolumes, subscriptionData)
            : updatedVolumes;

          if (startVM) draftVM.spec.running = true;

          if (applyBootSourceStorageClass) {
            const dataVolumeTemplates: V1DataVolumeTemplateSpec[] = getDataVolumeTemplates(vm).map(
              (dvt) => {
                if (isEqualObject(dvt?.spec?.sourceRef, templateBootSource?.source?.sourceRef)) {
                  return produce(dvt, (draftDVT) => {
                    draftDVT.spec.storage.storageClassName = applyBootSourceStorageClass;
                  });
                }

                return dvt;
              },
            );

            draftVM.spec.dataVolumeTemplates = dataVolumeTemplates;
          }
        });

        const quickCreatedVM = await quickCreateVM({
          models,
          processedTemplate,
          vm: !isEmpty(authorizedSSHKey) ? addSecretToVM(overrideVM, authorizedSSHKey) : overrideVM,
        });

        setIsQuickCreating(false);
        history.push(getResourceUrl({ model: VirtualMachineModel, resource: quickCreatedVM }));
      } catch (processError) {
        setIsQuickCreating(false);
        setQuickCreateError(processError);
      }
    };

    const onCustomize = (e: MouseEvent) => {
      e.preventDefault();

      if (isEmpty(template?.parameters)) {
        return processTemplate(template, namespace).then(async (processedTemplate) => {
          const vmObject = getTemplateVirtualMachineObject(processedTemplate);

          const updatedVM = produce(vmObject, (draftVM) => {
            draftVM.metadata.namespace = namespace;

            applyCPUMemory(draftVM, vm);
            applyTemplateMetadataToVM(draftVM, template);

            const updatedVolumes = applyCloudDriveCloudInitVolume(draftVM);
            draftVM.spec.template.spec.volumes = isRHELTemplate(processedTemplate)
              ? updateCloudInitRHELSubscription(updatedVolumes, subscriptionData)
              : updatedVolumes;
          });

          updateTabsData((tabsDataDraft) => {
            // additional objects
            tabsDataDraft.additionalObjects = processedTemplate.objects.filter((obj) =>
              !isEmpty(authorizedSSHKey)
                ? obj.kind !== VirtualMachineModel.kind || obj.kind !== SecretModel
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

          // update context vm
          await updateVM(
            !isEmpty(authorizedSSHKey) ? addSecretToVM(updatedVM, authorizedSSHKey) : updatedVM,
          );

          history.push(`/k8s/ns/${namespace}/templatescatalog/review`);
        });
      }
      let catalogUrl = `templatescatalog/customize?name=${template.metadata.name}&namespace=${template.metadata.namespace}&defaultSourceExists=${isBootSourceAvailable}`;

      if (vmName) {
        catalogUrl += `&vmName=${vmName}`;
      }

      updateTabsData((currentTabs) => {
        currentTabs.authorizedSSHKey = authorizedSSHKey;
      });

      if (!isEmpty(subscriptionData?.activationKey) && !isEmpty(subscriptionData?.organizationID)) {
        updateTabsData((currentTabsData) => ({ ...currentTabsData, subscriptionData }));
      }

      history.push(catalogUrl);
    };

    const onChangeStartVM = (checked: boolean) => {
      setStartVM(checked);
      updateTabsData((currentTabsData) => {
        return { ...currentTabsData, startVM: checked };
      });
    };

    return (
      <form className="template-catalog-drawer-form" id="quick-create-form">
        <Stack hasGutter>
          {canQuickCreate ? (
            <>
              <StackItem>
                <Split hasGutter>
                  <SplitItem className="template-catalog-drawer-form-name" isFilled>
                    <FormGroup fieldId="vm-name-field" isRequired label={t('VirtualMachine name')}>
                      <TextInput
                        aria-label="virtualmachine name"
                        data-test-id="template-catalog-vm-name-input"
                        isRequired
                        name="vmname"
                        onChange={setVMName}
                        type="text"
                        value={vmName}
                      />
                    </FormGroup>
                  </SplitItem>
                  <SplitItem>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Project')}</DescriptionListTerm>
                        <DescriptionListDescription>{namespace}</DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </SplitItem>
                  <AuthorizedSSHKey authorizedSSHKey={authorizedSSHKey} template={template} />
                </Split>
              </StackItem>
              <StackItem />
              <StackItem>
                <Checkbox
                  id="start-after-create-checkbox"
                  isChecked={startVM}
                  label={t('Start this VirtualMachine after creation')}
                  onChange={onChangeStartVM}
                />
              </StackItem>
            </>
          ) : (
            <StackItem>
              {t(
                'This Template requires some additional parameters. Click the Customize VirtualMachine button to complete the creation flow.',
              )}
            </StackItem>
          )}
          <StackItem />
          {quickCreateError && (
            <StackItem>
              <Alert isInline title={t('Quick create error')} variant={AlertVariant.danger}>
                {quickCreateError?.message}
              </Alert>
            </StackItem>
          )}

          <StackItem>
            <Split hasGutter>
              {canQuickCreate && (
                <SplitItem>
                  <Button
                    isDisabled={
                      !isBootSourceAvailable || isQuickCreating || !vmName || isEmpty(models)
                    }
                    onClick={(e: MouseEvent) => {
                      e.preventDefault();
                      onQuickCreate();
                    }}
                    data-test-id="quick-create-vm-btn"
                    form="quick-create-form"
                    isLoading={isQuickCreating || modelsLoading}
                    type="submit"
                  >
                    {t('Quick create VirtualMachine')}
                  </Button>
                </SplitItem>
              )}
              <SplitItem>
                <Button
                  data-test-id="customize-vm-btn"
                  isDisabled={!processedTemplateAccessReview}
                  onClick={onCustomize}
                  variant={canQuickCreate ? ButtonVariant.secondary : ButtonVariant.primary}
                >
                  {t('Customize VirtualMachine')}
                </Button>
              </SplitItem>
              <Button onClick={() => onCancel()} variant={ButtonVariant.link}>
                {t('Cancel')}
              </Button>
            </Split>
          </StackItem>
        </Stack>
      </form>
    );
  },
);
TemplatesCatalogDrawerCreateForm.displayName = 'TemplatesCatalogDrawerCreateForm';
