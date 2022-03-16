import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { Alert, AlertActionCloseButton, Button } from '@patternfly/react-core';

import { convertObjectToYaml, convertYAMLToObject } from './utils';

import './YAMLEditor.scss';
import { EditorDidMount } from 'react-monaco-editor';

type YAMLEditorProps = {
  object: K8sResourceCommon;
  onSave: (object: K8sResourceCommon) => Promise<void>;
  onChange?: (yaml: string) => void;
  isReadOnly?: boolean;
};

const EDITOR_TOOLS_SPACES = 75;

const YAMLEditor: React.FC<YAMLEditorProps> = ({ object, isReadOnly, onSave, onChange }) => {
  const { t } = useKubevirtTranslation();
  const [yaml, setYaml] = React.useState(convertObjectToYaml({ obj: object }));
  const [saved, setSaved] = React.useState(true);
  const [error, setError] = React.useState<any>();
  const [editorHeight, setEditorHeight] = React.useState<number>();
  const [success, setSuccess] = React.useState<any>();
  const yamlEditorRef = React.useRef<HTMLDivElement>();

  const editorDidMount: EditorDidMount = React.useCallback(
    (editor, monaco) => {
      editor.layout();
      editor.focus();
      monaco.editor.getModels()[0].updateOptions({ tabSize: 2 });
      onSave && editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, onSave); // eslint-disable-line no-bitwise
    },
    [onSave],
  );

  React.useLayoutEffect(() => {
    if (yamlEditorRef.current?.clientHeight) {
      setEditorHeight(yamlEditorRef.current?.clientHeight - EDITOR_TOOLS_SPACES);
    }
  }, []);

  const onSaveClick = async () => {
    setSaved(true);
    try {
      await onSave(convertYAMLToObject(yaml) as K8sResourceCommon);
      setSuccess(t('Successfully updated the VM'));
      setError(undefined);
    } catch (onSaveError) {
      setError(onSaveError);
    }
  };

  const onYAMLChange = React.useCallback((newYaml) => {
    setYaml(newYaml);
    setSaved(false);
    if (onChange) onChange(newYaml);
  }, []);

  return (
    <div className="yaml-container">
      <div className="yaml-editor" ref={yamlEditorRef}>
        {editorHeight && (
          <CodeEditor
            isDarkTheme
            isLineNumbersVisible
            code={yaml}
            onChange={onYAMLChange}
            language={Language.yaml}
            onEditorDidMount={editorDidMount}
            isReadOnly={isReadOnly}
            options={{
              scrollBeyondLastLine: false,
            }}
            isMinimapVisible
            isUploadEnabled
            isDownloadEnabled
            isCopyEnabled
            height={`${editorHeight}px`}
          />
        )}
        {error && (
          <Alert
            isInline
            className="co-alert co-alert--scrollable"
            variant="danger"
            title={t('An error occurred')}
            actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
          >
            <div className="co-pre-line">{error.message}</div>
          </Alert>
        )}
        {success && (
          <Alert
            isInline
            className="co-alert"
            variant="success"
            title={success}
            actionClose={<AlertActionCloseButton onClose={() => setSuccess(false)} />}
          />
        )}
      </div>
      <div className="yaml-controls">
        <Button onClick={onSaveClick} isDisabled={saved}>
          {t('Save')}
        </Button>
      </div>
    </div>
  );
};

export default YAMLEditor;
