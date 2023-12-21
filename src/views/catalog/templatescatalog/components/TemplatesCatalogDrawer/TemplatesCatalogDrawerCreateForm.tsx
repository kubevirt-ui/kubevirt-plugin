import React, { FC, memo } from 'react';

import { DRAWER_FORM_ID } from '@catalog/templatescatalog/utils/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
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

    const { isBootSourceAvailable, template, templateLoadingError } = useDrawerContext();

    const {
      createError,
      isCustomizeDisabled,
      isCustomizeLoading,
      isQuickCreateDisabled,
      isQuickCreateLoading,
      nameField,
      onChangeStartVM,
      onCustomize,
      onQuickCreate,
      onVMNameChange,
      startVM,
    } = useCreateDrawerForm(namespace, subscriptionData, authorizedSSHKey);

    const error = templateLoadingError || createError;
    return (
      <form className="template-catalog-drawer-form" id="quick-create-form">
        <Stack hasGutter>
          <>
            <StackItem>
              <Split hasGutter>
                <SplitItem className="template-catalog-drawer-form-name" isFilled>
                  <FormGroup fieldId="vm-name-field" isRequired label={t('VirtualMachine name')}>
                    <TextInput
                      aria-label="virtualmachine name"
                      data-test-id="template-catalog-vm-name-input"
                      isDisabled={Boolean(templateLoadingError)}
                      isRequired
                      name="vmname"
                      onChange={onVMNameChange}
                      type="text"
                      value={nameField}
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
                      ? t('Source not available')
                      : t(
                          'To enable Quick create button, fill all the required parameters and storage fields',
                        )
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
      </form>
    );
  },
);
