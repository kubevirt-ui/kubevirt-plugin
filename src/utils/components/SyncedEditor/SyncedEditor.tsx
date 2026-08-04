import React, { type ComponentType, type FC, useState } from 'react';
import isEqual from 'lodash/isEqual';

import {
  logEditorViewSwitched,
  TELEMETRY_EDITOR_VIEW_SWITCH,
} from '@kubevirt-utils/extensions/telemetry';
import { type ResourceTypeTelemetry } from '@kubevirt-utils/extensions/telemetry/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asyncYAMLToJS, safeJSToYAML } from '@kubevirt-utils/utils/yaml';
import { type K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import { EditorToggle } from './components/EditorToggle';
import { useEditorType } from './hooks/useEditorType';
import { YAML_TO_JS_OPTIONS } from './utils/constants';
import { EditorType, type FormEditorProps, type YAMLEditorProps } from './utils/types';

type SyncedEditorProps = {
  context?: {
    formContext: Record<string, unknown>;
    yamlContext: Record<string, unknown>;
  };
  displayConversionError?: boolean;
  FormEditor: ComponentType<FormEditorProps>;
  initialData?: K8sResourceKind;
  isEdit?: boolean;
  onChange?: (data: K8sResourceKind) => void;
  onChangeEditorType?: (newType: EditorType) => void;
  telemetryResourceType?: ResourceTypeTelemetry;
  telemetryStepOrField?: string;
  YAMLEditor: ComponentType<YAMLEditorProps>;
};

// Provides toggling and syncing between a form and yaml editor. The formData state is the source
// of truth. Both the form editor and the yaml editor update the formData state. Here's the basic logic of this component:
// In the form view:
//   - formData is both rendered and updated by the form component
//   - on toggle to YAML editor, yaml is parsed from current formData state.
// In the YAML view:
//   - on each yaml change, attempt to parse yaml to js:
//       - If it fails, nothing happens. formData remains unchanged.
//       - If successful, formData is updated to resulting js
//   - on toggle to form view, no action needs to be taken to sync because formData has remained up to date with each yaml change
export const SyncedEditor: FC<SyncedEditorProps> = ({
  context = {} as SyncedEditorProps['context'],
  displayConversionError,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FormEditor,
  initialData = {},
  isEdit = false,
  onChange = (): null => null,
  onChangeEditorType = (): void => undefined,
  telemetryResourceType,
  telemetryStepOrField,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  YAMLEditor,
}) => {
  const { t } = useKubevirtTranslation();
  const [formData, setFormData] = useState<K8sResourceKind>(initialData);
  const [yaml, setYAML] = useState(() =>
    safeJSToYAML(initialData, 'yamlData', {
      skipInvalid: true,
    }),
  );
  const [switchError, setSwitchError] = useState<string | undefined>();
  const [yamlWarning, setYAMLWarning] = useState<boolean>(false);
  const [editorType, setEditorType] = useEditorType();

  const { formContext, yamlContext } = context;

  const handleFormDataChange = (newFormData: K8sResourceKind = {}): void => {
    if (!isEqual(newFormData, formData)) {
      setFormData(newFormData);
      onChange(newFormData);
    }
  };

  const handleYAMLChange = (newYAML = ''): void => {
    asyncYAMLToJS(newYAML)
      .then((parsed) => {
        setSwitchError(undefined);
        handleFormDataChange(parsed);
        setYAML(safeJSToYAML(parsed, yaml, YAML_TO_JS_OPTIONS));
      })
      .catch((err) => setSwitchError(String(err)));
  };

  const changeEditorType = (newType: EditorType): void => {
    setEditorType(newType);
    onChangeEditorType(newType);

    logEditorViewSwitched(
      telemetryResourceType,
      newType === EditorType.YAML
        ? TELEMETRY_EDITOR_VIEW_SWITCH.YAML_TO_FORM
        : TELEMETRY_EDITOR_VIEW_SWITCH.FORM_TO_YAML,
      telemetryStepOrField,
    );
  };

  const handleToggleToForm = (): void => {
    if (switchError === undefined) {
      changeEditorType(EditorType.Form);
    } else {
      setYAMLWarning(true);
    }
  };

  const handleToggleToYAML = (): void => {
    setYAML(safeJSToYAML(formData, yaml, YAML_TO_JS_OPTIONS));
    changeEditorType(EditorType.YAML);
  };

  const onClickYAMLWarningConfirm = (): void => {
    setSwitchError(undefined);
    setYAMLWarning(false);
    changeEditorType(EditorType.Form);
  };

  const onClickYAMLWarningCancel = (): void => {
    setYAMLWarning(false);
  };

  const onChangeType = (newType: EditorType): void => {
    if (newType === EditorType.YAML) {
      handleToggleToYAML();
    } else if (newType === EditorType.Form) {
      handleToggleToForm();
    }
  };

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
        <FormEditor
          formData={formData}
          isEdit={isEdit}
          onChange={handleFormDataChange}
          {...formContext}
        />
      ) : (
        <YAMLEditor
          initialYAML={yaml}
          isEdit={isEdit}
          onChange={handleYAMLChange}
          {...yamlContext}
        />
      )}
    </>
  );
};
