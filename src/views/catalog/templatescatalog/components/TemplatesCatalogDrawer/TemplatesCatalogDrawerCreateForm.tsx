import React, { FC, memo } from 'react';

import { DRAWER_FORM_ID } from '@catalog/templatescatalog/utils/consts';
import { NOT_SUPPORTED_VM_ERROR } from '@catalog/utils/constants';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { validateVMName } from '@kubevirt-utils/components/VMNameValidationHelperText/utils/utils';
import VMNameValidationHelperText from '@kubevirt-utils/components/VMNameValidationHelperText/VMNameValidationHelperText';
import {
  RUNSTRATEGY_ALWAYS,
  RUNSTRATEGY_RERUNONFAILURE,
} from '@kubevirt-utils/constants/constants';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Checkbox,
  DescriptionList,
  Form,
  FormGroup,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';

import useCreateDrawerForm from './hooks/useCreateDrawerForm';
import { useDrawerContext } from './hooks/useDrawerContext';
import AuthorizedSSHKey from './AuthorizedSSHKey';

type TemplatesCatalogDrawerCreateFormProps = {
  authorizedSSHKey: string;
  namespace: string;
  onCancel: () => void;
  subscriptionData: RHELAutomaticSubscriptionData;
};

export const TemplatesCatalogDrawerCreateForm: FC<TemplatesCatalogDrawerCreateFormProps> = memo(
  ({ authorizedSSHKey, namespace, onCancel, subscriptionData }) => {
    const { t } = useKubevirtTranslation();
    const isACMPage = useIsACMPage();
    const cluster = useClusterParam();

    const { isBootSourceAvailable, templateLoadingError } = useDrawerContext();
    const [__, vmsNotSupported] = useNamespaceUDN(namespace);

    const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);

    const {
      createError,
      folder,
      isCustomizeDisabled,
      isCustomizeLoading,
      isQuickCreateDisabled,
      isQuickCreateLoading,
      nameField,
      onChangeFolder,
      onChangeStartVM,
      onCustomize,
      onQuickCreate,
      onVMNameChange,
      runStrategy,
      startVM,
    } = useCreateDrawerForm(namespace, subscriptionData, authorizedSSHKey);

    const vmNameValidated = validateVMName(nameField);

    const vmsNotSupportedError = vmsNotSupported ? NOT_SUPPORTED_VM_ERROR : null;

    const error = templateLoadingError || createError || vmsNotSupportedError;
    return (
      <Form className="template-catalog-drawer-form" id="quick-create-form">
        <Stack hasGutter>
          <>
            <StackItem>
              <Split hasGutter>
                <SplitItem className="template-catalog-drawer-form-name" isFilled>
                  <FormGroup fieldId="vm-name-field" isRequired label={t('VirtualMachine name')}>
                    <TextInput
                      aria-label="virtualmachine name"
                      data-test-id="template-catalog-vm-name-input"
                      form={DRAWER_FORM_ID}
                      isDisabled={Boolean(templateLoadingError)}
                      isRequired
                      name="vmname"
                      onChange={(_, value: string) => onVMNameChange(value)}
                      type="text"
                      validated={vmNameValidated}
                      value={nameField}
                    />
                  </FormGroup>
                  <VMNameValidationHelperText vmName={nameField} />
                </SplitItem>
                {treeViewFoldersEnabled && (
                  <SplitItem>
                    <FormGroup fieldId="vm-folder-field" label={t('Folder')}>
                      <FolderSelect
                        setSelectedFolder={(newFolder) => {
                          onChangeFolder(newFolder);
                        }}
                        namespace={namespace}
                        selectedFolder={folder}
                      />
                    </FormGroup>
                  </SplitItem>
                )}
                <SplitItem>
                  <DescriptionList>
                    <VirtualMachineDescriptionItem
                      descriptionData={namespace}
                      descriptionHeader={t('Project')}
                    />
                  </DescriptionList>
                </SplitItem>
                {isACMPage && (
                  <SplitItem>
                    <DescriptionList>
                      <VirtualMachineDescriptionItem
                        descriptionData={cluster}
                        descriptionHeader={t('Cluster')}
                      />
                    </DescriptionList>
                  </SplitItem>
                )}
                <AuthorizedSSHKey authorizedSSHKey={authorizedSSHKey} namespace={namespace} />
              </Split>
            </StackItem>
            <StackItem />
            <StackItem>
              <Checkbox
                isChecked={
                  startVM ||
                  runStrategy === RUNSTRATEGY_ALWAYS ||
                  runStrategy === RUNSTRATEGY_RERUNONFAILURE
                }
                label={
                  runStrategy
                    ? t('Start this VirtualMachine after creation ({{runStrategy}})', {
                        runStrategy,
                      })
                    : t('Start this VirtualMachine after creation')
                }
                id="start-after-create-checkbox"
                onChange={(_, checked: boolean) => onChangeStartVM(checked)}
              />
            </StackItem>
          </>
          <StackItem />
          {error && (
            <StackItem>
              <Alert isInline title={t('Quick create error')} variant={AlertVariant.danger}>
                <Stack hasGutter>
                  <StackItem>{error.message}</StackItem>
                  {error?.href && (
                    <StackItem>
                      <a href={error.href} rel="noreferrer" target="_blank">
                        {error.href}
                      </a>
                    </StackItem>
                  )}
                </Stack>
              </Alert>
            </StackItem>
          )}

          <StackItem>
            <Split hasGutter>
              <SplitItem>
                <Tooltip
                  content={
                    isBootSourceAvailable
                      ? t(
                          'To enable Quick create button, fill all the required parameters and storage fields',
                        )
                      : t('Source not available')
                  }
                  hidden={!isQuickCreateDisabled}
                >
                  <span>
                    <Button
                      data-test-id="quick-create-vm-btn"
                      form={DRAWER_FORM_ID}
                      isDisabled={isQuickCreateDisabled}
                      isLoading={isQuickCreateLoading}
                      onClick={onQuickCreate}
                      type="submit"
                    >
                      {t('Quick create VirtualMachine')}
                    </Button>
                  </span>
                </Tooltip>
              </SplitItem>
              <SplitItem>
                <Button
                  data-test-id="customize-vm-btn"
                  form={DRAWER_FORM_ID}
                  isDisabled={isCustomizeDisabled}
                  isLoading={isCustomizeLoading}
                  onClick={onCustomize}
                  variant={ButtonVariant.secondary}
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
      </Form>
    );
  },
);
