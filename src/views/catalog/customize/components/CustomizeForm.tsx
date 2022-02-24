import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ActionGroup,
  Button,
  ExpandableSection,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Form,
  Popover,
  PopoverPosition,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { getTemplateVirtualMachineObject } from '../../utils/templateGetters';
import { useWizardVMContext } from '../../utils/WizardVMContext';
import { CustomizeFormActions } from '../customizeFormActions';
import customizeFormReducer, { initializeReducer } from '../customizeFormReducer';
import { formValidation, getTemplateStorageQuantity, processTemplate } from '../utils';

import { DISK_SOURCE, DiskSource } from './DiskSource';
import { FieldGroup } from './FieldGroup';

type CustomizeFormProps = {
  template: V1Template;
};

export const CustomizeForm: React.FC<CustomizeFormProps> = ({ template }) => {
  const { ns } = useParams<{ ns: string }>();
  const history = useHistory();
  const { updateVM } = useWizardVMContext();
  const { t } = useKubevirtTranslation();
  const [optionalFieldsExpanded, setOptionalFieldsExpanded] = React.useState(true);
  const [storageFieldsExpanded, setStorageFieldsExpanded] = React.useState(true);

  const [state, dispatch] = React.useReducer(customizeFormReducer, null, () =>
    initializeReducer(template, t),
  );

  const {
    parametersErrors,
    diskSourceError,
    volumeError,
    diskSourceCustomization,
    loading,
    requiredFields,
    optionalFields,
    customizableDiskSource,
  } = state;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    dispatch({ type: CustomizeFormActions.Loading });

    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);

      const errors = formValidation(t, formData, requiredFields, diskSourceCustomization);

      if (errors) {
        dispatch({ type: CustomizeFormActions.FormError, payload: errors });
      } else {
        const processedTemplate = await processTemplate(
          template,
          ns,
          formData,
          diskSourceCustomization,
        );
        dispatch({ type: CustomizeFormActions.Success });
        const vm = getTemplateVirtualMachineObject(processedTemplate);
        vm.metadata.namespace = ns;
        updateVM(vm);
        history.push(
          `/k8s/ns/${ns || 'default'}/templatescatalog/review?name=${
            template.metadata.name
          }&namespace=${template.metadata.namespace}`,
        );
      }
    } catch (error) {
      dispatch({ type: CustomizeFormActions.ApiError, payload: error.message });
      console.error(error);
    }
  };

  const onDiskSourceChange = React.useCallback((diskSource: DISK_SOURCE) => {
    dispatch({ type: CustomizeFormActions.SetDiskSource, payload: diskSource });
  }, []);

  return (
    <Form onSubmit={onSubmit}>
      {requiredFields?.map((field) => (
        <FieldGroup key={field.name} field={field} error={parametersErrors?.[field.name]} />
      ))}

      {customizableDiskSource && (
        <Stack hasGutter>
          <StackItem>
            <Flex>
              <FlexItem spacer={{ default: 'spacerNone' }}>
                <ExpandableSectionToggle
                  isExpanded={storageFieldsExpanded}
                  onToggle={() => setStorageFieldsExpanded(!storageFieldsExpanded)}
                >
                  {t('Storage')}
                </ExpandableSectionToggle>
              </FlexItem>
              <FlexItem>
                <Popover
                  position={PopoverPosition.top}
                  aria-label="Condition Popover"
                  bodyContent={() => (
                    <div>
                      {t(
                        'You can customize the templates storage by overriding the original parameters',
                      )}
                    </div>
                  )}
                >
                  <HelpIcon />
                </Popover>
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem>
            <ExpandableSection
              data-test-id="expandable-storage-section"
              isExpanded={storageFieldsExpanded}
              isDetached
            >
              <DiskSource
                onChange={onDiskSourceChange}
                error={diskSourceError}
                volumeError={volumeError}
                initialVolumeQuantity={getTemplateStorageQuantity(template)}
              />
            </ExpandableSection>
          </StackItem>
        </Stack>
      )}
      {optionalFields && optionalFields.length > 0 && (
        <ExpandableSection
          toggleText={t('Optional parameters')}
          data-test-id="expandable-optional-section"
          onToggle={() => setOptionalFieldsExpanded(!optionalFieldsExpanded)}
          isExpanded={optionalFieldsExpanded}
        >
          {optionalFields?.map((field) => (
            <FieldGroup key={field.name} field={field} />
          ))}
        </ExpandableSection>
      )}

      <div className="customize-vm__footer">
        <ActionGroup>
          <Button
            variant="primary"
            type="submit"
            isLoading={loading}
            data-test-id="customize-vm-submit-button"
          >
            {t('Review and create Virtual Machine')}
          </Button>
          <Button variant="link">{t('Cancel')}</Button>
        </ActionGroup>
      </div>
    </Form>
  );
};
