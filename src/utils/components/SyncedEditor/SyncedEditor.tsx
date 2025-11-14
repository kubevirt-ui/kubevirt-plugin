import React, { ComponentType, FC, useState } from 'react';
import * as _ from 'lodash';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Bullseye, Button, ButtonVariant } from '@patternfly/react-core';

import Loading from '../Loading/Loading';

import { EditorToggle, EditorType } from './EditorToggle';
import { useEditorType } from './useEditorType';
import { asyncYAMLToJS, safeJSToYAML } from './yaml';

const YAML_KEY_ORDER = ['apiVerion', 'kind', 'metadata', 'spec', 'status'];
export const YAML_TO_JS_OPTIONS = {
  skipInvalid: true,
  sortKeys: (a, b) => _.indexOf(YAML_KEY_ORDER, a) - _.indexOf(YAML_KEY_ORDER, b),
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
//
//  This means that when switching from YAML to Form, you can lose changes if the YAML editor contains unparsable YAML
//  TODO Add an extra step when switching from yaml to form to warn user if they are about to lose changes.
export const SyncedEditor: FC<SyncedEditorProps> = ({
  context = {} as SyncedEditorProps['context'],
  displayConversionError,
  FormEditor,
  initialData = {},
  initialType = EditorType.Form,
  lastViewUserSettingKey,
  onChange = () => null,
  onChangeEditorType = () => null,
  prune,
  YAMLEditor,
}) => {
  const { formContext, yamlContext } = context;
  const { t } = useKubevirtTranslation();
  const [formData, setFormData] = useState<K8sResourceKind>(initialData);
  const [yaml, setYAML] = useState(
    safeJSToYAML(initialData, 'yamlData', {
      skipInvalid: true,
    }),
  );
  const [switchError, setSwitchError] = useState<string | undefined>();
  const [yamlWarning, setYAMLWarning] = useState<boolean>(false);
  const [editorType, setEditorType, loaded] = useEditorType(lastViewUserSettingKey, initialType);

  const handleFormDataChange = (newFormData: K8sResourceKind = {}) => {
    if (!_.isEqual(newFormData, formData)) {
      setFormData(newFormData);
      onChange(newFormData);
    }
  };

  const handleYAMLChange = (newYAML = '') => {
    asyncYAMLToJS(newYAML)
      .then((js) => {
        setSwitchError(undefined);
        handleFormDataChange(js);
        setYAML(safeJSToYAML(prune?.(formData) ?? formData, yaml, YAML_TO_JS_OPTIONS));
      })
      .catch((err) => setSwitchError(String(err)));
  };

  const changeEditorType = (newType: EditorType): void => {
    setEditorType(newType);
    onChangeEditorType(newType);
  };

  const handleToggleToForm = () => {
    if (switchError === undefined) {
      changeEditorType(EditorType.Form);
    } else {
      setYAMLWarning(true);
    }
  };

  const handleToggleToYAML = () => {
    setYAML(safeJSToYAML(prune?.(formData) ?? formData, yaml, YAML_TO_JS_OPTIONS));
    changeEditorType(EditorType.YAML);
  };

  const onClickYAMLWarningConfirm = () => {
    setSwitchError(undefined);
    setYAMLWarning(false);
    changeEditorType(EditorType.Form);
  };

  const onClickYAMLWarningCancel = () => {
    setYAMLWarning(false);
  };

  const onChangeType = (newType) => {
    switch (newType) {
      case EditorType.YAML:
        handleToggleToYAML();
        break;
      case EditorType.Form:
        handleToggleToForm();
        break;
      default:
        break;
    }
  };

  return loaded ? (
    <>
      <EditorToggle onChange={onChangeType} value={editorType} />
      {yamlWarning && (
        <Alert
          className="co-synced-editor__yaml-warning"
          isInline
          title={t('Invalid YAML cannot be persisted')}
          variant={AlertVariant.danger}
        >
          {displayConversionError && <p>{switchError}</p>}
          <p>{t('Switching to form view will delete any invalid YAML.')}</p>
          <Button onClick={onClickYAMLWarningConfirm} variant={ButtonVariant.danger}>
            {t('Switch and delete')}
          </Button>
          &nbsp;
          <Button onClick={onClickYAMLWarningCancel} variant={ButtonVariant.secondary}>
            {t('Cancel')}
          </Button>
        </Alert>
      )}
      {editorType === EditorType.Form ? (
        <FormEditor
          formData={formData}
          onChange={handleFormDataChange}
          prune={prune}
          {...formContext}
        />
      ) : (
        <YAMLEditor initialYAML={yaml} onChange={handleYAMLChange} {...yamlContext} />
      )}
    </>
  ) : (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
};

type FormEditorProps = {
  formData?: K8sResourceKind;
  onChange?: (data: K8sResourceKind) => void;
  prune?: (data: K8sResourceKind) => any;
};

type YAMLEditorProps = {
  initialYAML?: string;
  onChange?: (yaml: string) => void;
};

type SyncedEditorProps = {
  context?: {
    formContext: { [key: string]: any };
    yamlContext: { [key: string]: any };
  };
  displayConversionError?: boolean;
  FormEditor: ComponentType<FormEditorProps>;
  initialData?: K8sResourceKind;
  initialType?: EditorType;
  lastViewUserSettingKey: string;
  onChange?: (data: K8sResourceKind) => void;
  onChangeEditorType?: (newType: EditorType) => void;
  prune?: (data: K8sResourceKind) => any;
  YAMLEditor: ComponentType<YAMLEditorProps>;
};
