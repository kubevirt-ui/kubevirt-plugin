import React, { FC, memo, MouseEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import produce from 'immer';

import {
  extractParameterNameFromMetadataName,
  replaceTemplateParameterValue,
} from '@catalog/customize/utils';
import { quickCreateVM } from '@catalog/utils/quick-create-vm';
import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
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

type TemplatesCatalogDrawerCreateFormProps = {
  namespace: string;
  template: V1Template;
  canQuickCreate: boolean;
  isBootSourceAvailable: boolean;
  onCancel: () => void;
  initialVMName?: string;
};

export const TemplatesCatalogDrawerCreateForm: FC<TemplatesCatalogDrawerCreateFormProps> = memo(
  ({ namespace, template, canQuickCreate, isBootSourceAvailable, onCancel, initialVMName }) => {
    const history = useHistory();
    const { t } = useKubevirtTranslation();
    const { vm, updateTabsData } = useWizardVMContext();

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

    const onQuickCreate = () => {
      setIsQuickCreating(true);
      setQuickCreateError(undefined);

      const parameterForName = extractParameterNameFromMetadataName(template) || 'NAME';

      const templateToProcess = produce(template, (draftTemplate) => {
        if (parameterForName)
          replaceTemplateParameterValue(draftTemplate, parameterForName, vmName);

        if (vm?.spec?.template) {
          const vmObject = getTemplateVirtualMachineObject(draftTemplate);
          ensurePath(vmObject, [
            'spec.template.spec.domain.resources',
            'spec.template.spec.domain.cpu',
          ]);
          vmObject.spec.template.spec.domain.resources.requests = {
            ...vmObject?.spec?.template?.spec?.domain?.resources?.requests,
            memory: `${vm.spec.template.spec.domain.resources.requests['memory']}`,
          };
          vmObject.spec.template.spec.domain.cpu.cores = vm.spec.template.spec.domain.cpu.cores;
        }
      });

      quickCreateVM({
        template: templateToProcess,
        models,
        overrides: { name: vmName, namespace, startVM },
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
      let catalogUrl = `templatescatalog/customize?name=${template.metadata.name}&namespace=${template.metadata.namespace}&defaultSourceExists=${isBootSourceAvailable}`;

      if (vmName) {
        catalogUrl += `&vmName=${vmName}`;
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
                  <SplitItem>
                    <FormGroup
                      label={t('VirtualMachine name')}
                      isRequired
                      className="template-catalog-drawer-form-name"
                      fieldId="vm-name-field"
                    >
                      <TextInput
                        isRequired
                        type="text"
                        data-test-id="template-catalog-vm-name-input"
                        name="vmname"
                        aria-label="virtualmachine name"
                        value={vmName}
                        onChange={setVMName}
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
                </Split>
              </StackItem>
              <StackItem />
              <StackItem>
                <Checkbox
                  id="start-after-create-checkbox"
                  isChecked={startVM}
                  onChange={onChangeStartVM}
                  label={t('Start this VirtualMachine after creation')}
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
              <Alert variant={AlertVariant.danger} title={t('Quick create error')} isInline>
                {quickCreateError?.message}
              </Alert>
            </StackItem>
          )}

          <StackItem>
            <Split hasGutter>
              {canQuickCreate && (
                <SplitItem>
                  <Button
                    data-test-id="quick-create-vm-btn"
                    type="submit"
                    form="quick-create-form"
                    isLoading={isQuickCreating || modelsLoading}
                    isDisabled={
                      !isBootSourceAvailable || isQuickCreating || !vmName || isEmpty(models)
                    }
                    onClick={(e: MouseEvent) => {
                      e.preventDefault();
                      onQuickCreate();
                    }}
                  >
                    {t('Quick create VirtualMachine')}
                  </Button>
                </SplitItem>
              )}
              <SplitItem>
                <Button
                  data-test-id="customize-vm-btn"
                  variant={canQuickCreate ? ButtonVariant.secondary : ButtonVariant.primary}
                  onClick={onCustomize}
                  isDisabled={!processedTemplateAccessReview}
                >
                  {t('Customize VirtualMachine')}
                </Button>
              </SplitItem>
              <Button variant={ButtonVariant.link} onClick={() => onCancel()}>
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
