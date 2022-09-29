import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import produce from 'immer';

import { DEFAULT_NAMESPACE } from '@catalog/customize/constants';
import {
  extractParameterNameFromMetadataName,
  getVMName,
  replaceTemplateParameterValue,
  setValueForRequiredParams,
} from '@catalog/customize/utils';
import { quickCreateVM } from '@catalog/utils/quick-create-vm';
import { ensurePath, useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  getTemplateVirtualMachineObject,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { k8sCreate, useK8sModels } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
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
};

export const TemplatesCatalogDrawerCreateForm: React.FC<TemplatesCatalogDrawerCreateFormProps> =
  React.memo(({ namespace, template, canQuickCreate, isBootSourceAvailable, onCancel }) => {
    const history = useHistory();
    const { t } = useKubevirtTranslation();
    const { updateVM } = useWizardVMContext();
    const { ns } = useParams<{ ns: string }>();

    const [vmName, setVMName] = React.useState('emptyname');
    const [startVM, setStartVM] = React.useState(true);
    const [isQuickCreating, setIsQuickCreating] = React.useState(false);
    const [quickCreateError, setQuickCreateError] = React.useState(undefined);
    const [isPreparingToCustomizeVM, setIsPreparingToCustomizeVM] = React.useState(false);
    const [customizeVMError, setCustomizeVMError] = React.useState(undefined);
    const [models, modelsLoading] = useK8sModels();
    const [defaultStorageClass, defaultStorageClassLoaded] = useDefaultStorageClass();

    React.useEffect(() => {
      getVMName(template).then(setVMName);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run only once when it's initially rendering

    const onQuickCreate = () => {
      setIsQuickCreating(true);
      setQuickCreateError(undefined);

      const parameterForName = extractParameterNameFromMetadataName(template);
      const templateToProcess = produce(template, (draftTemplate) => {
        replaceTemplateParameterValue(draftTemplate, parameterForName, vmName);
      });

      quickCreateVM({
        template: templateToProcess,
        models,
        overrides: { name: vmName, namespace, startVM, defaultStorageClass },
      })
        .then((vm) => {
          setIsQuickCreating(false);
          history.push(getResourceUrl(VirtualMachineModel, vm));
        })
        .catch((err) => {
          setIsQuickCreating(false);
          setQuickCreateError(err);
        });
    };

    const onCustomizeVM = () => {
      setIsPreparingToCustomizeVM(true);
      setCustomizeVMError(undefined);

      // check for the required params and specify some default value for them to get the template processed successfully
      // required parameters' values will be specified later  by the user anyway, during customization process
      const templateToProcess = setValueForRequiredParams(template);

      k8sCreate<V1Template>({
        model: ProcessedTemplatesModel,
        data: templateToProcess,
        queryParams: {
          dryRun: 'All',
        },
      })
        .then((processedTemplate) => {
          const vmObj = getTemplateVirtualMachineObject(processedTemplate);
          const updatedVM = produce(vmObj, (vmDraft) => {
            ensurePath(vmDraft, 'metadata.labels');
            vmDraft.metadata.name = vmName;
            vmDraft.metadata.namespace = ns || DEFAULT_NAMESPACE;
            vmDraft.metadata.labels[LABEL_USED_TEMPLATE_NAME] = processedTemplate.metadata.name;
            vmDraft.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] =
              processedTemplate.metadata.namespace;
          });
          updateVM(updatedVM)
            .then(() => {
              setIsPreparingToCustomizeVM(false);
              history.push(
                `templatescatalog/customize?name=${template.metadata.name}&namespace=${template.metadata.namespace}&defaultSourceExists=${canQuickCreate}`,
              );
            })
            .catch((err) => {
              setIsPreparingToCustomizeVM(false);
              setCustomizeVMError(err);
            });
        })
        .catch((err) => {
          setIsPreparingToCustomizeVM(false);
          setCustomizeVMError(err);
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
                        data-test-id="vm-name-input"
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
                  onChange={(v) => setStartVM(v)}
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
              <Alert variant="danger" title={t('Quick create error')} isInline>
                {quickCreateError.message}
              </Alert>
            </StackItem>
          )}
          {customizeVMError && (
            <StackItem>
              <Alert variant="danger" title={t('Customize VM error')} isInline>
                {customizeVMError.message}
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
                    isLoading={isQuickCreating || modelsLoading || !defaultStorageClassLoaded}
                    isDisabled={
                      !isBootSourceAvailable || isQuickCreating || !vmName || modelsLoading
                    }
                    onClick={(e) => {
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
                  isLoading={isPreparingToCustomizeVM}
                  onClick={(e) => {
                    e.preventDefault();
                    onCustomizeVM();
                  }}
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
  });
TemplatesCatalogDrawerCreateForm.displayName = 'TemplatesCatalogDrawerCreateForm';
