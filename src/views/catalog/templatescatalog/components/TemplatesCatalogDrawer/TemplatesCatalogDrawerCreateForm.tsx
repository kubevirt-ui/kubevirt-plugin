import React, { FC, memo, MouseEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import produce from 'immer';

import { NAME_INPUT_FIELD } from '@catalog/customize/constants';
import { isNameParameterExists, replaceTemplateParameterValue } from '@catalog/customize/utils';
import { quickCreateVM } from '@catalog/utils/quick-create-vm';
import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import {
  ProcessedTemplatesModel,
  SecretModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getMemoryCPU } from '@kubevirt-utils/resources/vm';
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
  }) => {
    const history = useHistory();
    const { t } = useKubevirtTranslation();
    const { updateTabsData, vm } = useWizardVMContext();

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

    const onQuickCreate = (e: MouseEvent) => {
      e.preventDefault();

      setIsQuickCreating(true);
      setQuickCreateError(undefined);

      const nameParameterExists = isNameParameterExists(template);

      const templateToProcess = produce(template, (draftTemplate) => {
        if (nameParameterExists)
          replaceTemplateParameterValue(draftTemplate, NAME_INPUT_FIELD, vmName);

        const vmObject = getTemplateVirtualMachineObject(draftTemplate);

        if (!isEmpty(authorizedSSHKey)) {
          draftTemplate.objects = template.objects.filter((obj) => obj?.kind !== SecretModel.kind);
        }

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
        }
      });

      quickCreateVM({
        models,
        overrides: { authorizedSSHKey, name: vmName, namespace, startVM, subscriptionData },
        template: templateToProcess,
      })
        .then((quickCreatedVM) => {
          setIsQuickCreating(false);
          history.push(getResourceUrl({ model: VirtualMachineModel, resource: quickCreatedVM }));
        })
        .catch((err) => {
          setIsQuickCreating(false);
          setQuickCreateError(err);
        });
    };

    const onCustomize = (e: MouseEvent) => {
      e.preventDefault();

      updateTabsData((currentTabs) => {
        currentTabs.authorizedSSHKey = authorizedSSHKey;
      });

      if (!isEmpty(subscriptionData?.activationKey) && !isEmpty(subscriptionData?.organizationID)) {
        updateTabsData((currentTabsData) => ({ ...currentTabsData, subscriptionData }));
      }

      history.push(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/templatescatalog/review`);
    };

    const onChangeStartVM = (checked: boolean) => {
      setStartVM(checked);
      updateTabsData((currentTabsData) => {
        return { ...currentTabsData, startVM: checked };
      });
    };

    const areButtonsDisabled =
      !isBootSourceAvailable ||
      isQuickCreating ||
      !vmName ||
      isEmpty(models) ||
      !processedTemplateAccessReview;

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
            <StackItem>{t('This Template requires some additional parameters.')}</StackItem>
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
              <SplitItem>
                <Button
                  data-test-id="quick-create-vm-btn"
                  form="quick-create-form"
                  isDisabled={areButtonsDisabled}
                  isLoading={isQuickCreating || modelsLoading}
                  onClick={onQuickCreate}
                  type="submit"
                >
                  {t('Quick create VirtualMachine')}
                </Button>
              </SplitItem>
              <SplitItem>
                <Button
                  data-test-id="customize-vm-btn"
                  isDisabled={areButtonsDisabled}
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
