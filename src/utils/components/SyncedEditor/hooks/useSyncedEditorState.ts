import { useState } from 'react';

import {
  logEditorViewSwitched,
  TELEMETRY_EDITOR_VIEW_SWITCH,
} from '@kubevirt-utils/extensions/telemetry';
import { type ResourceTypeTelemetry } from '@kubevirt-utils/extensions/telemetry/utils/types';
import { type K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

import { YAML_TO_JS_OPTIONS } from '../utils/constants';
import { EditorType } from '../utils/types';
import { asyncYAMLToJS, safeJSToYAML } from '../utils/yaml';
import { useEditorType } from './useEditorType';

type UseSyncedEditorStateArgs = {
  initialData: K8sResourceKind;
  onChange: (data: K8sResourceKind) => void;
  onChangeEditorType: (newType: EditorType) => void;
  telemetryResourceType?: ResourceTypeTelemetry;
  telemetryStepOrField?: string;
};

type UseSyncedEditorStateResult = {
  editorType: EditorType;
  formData: K8sResourceKind;
  handleFormDataChange: (newFormData?: K8sResourceKind) => void;
  handleYAMLChange: (newYAML?: string) => void;
  onChangeType: (newType: EditorType) => void;
  onClickYAMLWarningCancel: () => void;
  onClickYAMLWarningConfirm: () => void;
  switchError: string | undefined;
  yaml: string;
  yamlWarning: boolean;
};

export const useSyncedEditorState = ({
  initialData,
  onChange,
  onChangeEditorType,
  telemetryResourceType,
  telemetryStepOrField,
}: UseSyncedEditorStateArgs): UseSyncedEditorStateResult => {
  const [formData, setFormData] = useState<K8sResourceKind>(initialData);
  const [yaml, setYAML] = useState(() =>
    safeJSToYAML(initialData, 'yamlData', { skipInvalid: true }),
  );
  const [switchError, setSwitchError] = useState<string | undefined>();
  const [yamlWarning, setYAMLWarning] = useState<boolean>(false);
  const [editorType, setEditorType] = useEditorType();

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

  const handleFormDataChange = (newFormData: K8sResourceKind = {}): void => {
    if (JSON.stringify(newFormData) !== JSON.stringify(formData)) {
      setFormData(newFormData);
      onChange(newFormData);
    }
  };

  const handleYAMLChange = (newYAML = ''): void => {
    asyncYAMLToJS(newYAML)
      .then((jsObject) => {
        setSwitchError(undefined);
        handleFormDataChange(jsObject);
        setYAML(safeJSToYAML(jsObject, yaml, YAML_TO_JS_OPTIONS));
      })
      .catch((err) => setSwitchError(String(err)));
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

  return {
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
  };
};
