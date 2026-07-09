import React, { type ComponentType, type FC } from 'react';

import { type ResourceTypeTelemetry } from '@kubevirt-utils/extensions/telemetry/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import { EditorToggle } from './components/EditorToggle';
import { useSyncedEditorState } from './hooks/useSyncedEditorState';
import { EditorType, type FormEditorProps, type YAMLEditorProps } from './utils/types';

type SyncedEditorProps = {
  context?: {
    formContext: Record<string, unknown>;
    yamlContext: Record<string, unknown>;
  };
  displayConversionError?: boolean;
  formEditor: ComponentType<FormEditorProps>;
  initialData?: K8sResourceKind;
  isEdit?: boolean;
  onChange?: (data: K8sResourceKind) => void;
  onChangeEditorType?: (newType: EditorType) => void;
  telemetryResourceType?: ResourceTypeTelemetry;
  telemetryStepOrField?: string;
  yamlEditor: ComponentType<YAMLEditorProps>;
};

export const SyncedEditor: FC<SyncedEditorProps> = ({
  context = {} as SyncedEditorProps['context'],
  displayConversionError,
  formEditor,
  initialData = {},
  isEdit = false,
  onChange = (): void => undefined,
  onChangeEditorType = (): void => undefined,
  telemetryResourceType,
  telemetryStepOrField,
  yamlEditor,
}) => {
  const { t } = useKubevirtTranslation();
  const FormEditorComponent = formEditor;
  const YAMLEditorComponent = yamlEditor;

  const {
    editorType,
    formData,
    handleFormDataChange,
    handleYAMLChange,
    onChangeType,
    onClickYAMLWarningCancel,
    onClickYAMLWarningConfirm,
    switchError,
    yaml,
    yamlWarning,
  } = useSyncedEditorState({
    initialData,
    onChange,
    onChangeEditorType,
    telemetryResourceType,
    telemetryStepOrField,
  });

  const { formContext, yamlContext } = context;

  return (
    <>
      <EditorToggle onChange={onChangeType} value={editorType} />
      {yamlWarning && (
        <Alert
          actionLinks={
            <>
              <Button onClick={onClickYAMLWarningConfirm} variant={ButtonVariant.danger}>
                {t('Switch and delete')}
              </Button>
              <Button onClick={onClickYAMLWarningCancel} variant={ButtonVariant.secondary}>
                {t('Cancel')}
              </Button>
            </>
          }
          className="pf-v6-u-m-md"
          isInline
          title={t('Invalid YAML cannot be persisted')}
          variant={AlertVariant.danger}
        >
          {displayConversionError && <p>{switchError}</p>}
          <p>{t('Switching to form view will delete any invalid YAML.')}</p>
        </Alert>
      )}
      {editorType === EditorType.Form ? (
        <FormEditorComponent
          formData={formData}
          isEdit={isEdit}
          onChange={handleFormDataChange}
          {...formContext}
        />
      ) : (
        <YAMLEditorComponent
          initialYAML={yaml}
          isEdit={isEdit}
          onChange={handleYAMLChange}
          {...yamlContext}
        />
      )}
    </>
  );
};
