import * as React from 'react';
import { dump } from 'js-yaml';

import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertActionCloseButton, Divider } from '@patternfly/react-core';

import './CloudInitEditor.scss';

type CloudInitEditorProps = {
  cloudInitVolume: V1Volume;
  onSave: (yaml: string) => void;
};

const EDITOR_TOOLS_SPACES = 75;

export const _CloudInitEditor: React.FC<CloudInitEditorProps> = ({ cloudInitVolume, onSave }) => {
  const { t } = useKubevirtTranslation();
  const cloudInitData = cloudInitVolume?.cloudInitNoCloud || cloudInitVolume?.cloudInitConfigDrive;

  const [editorHeight, setEditorHeight] = React.useState<number>();
  const [saved, setSaved] = React.useState<boolean>(false);
  const yamlEditorRef = React.useRef<HTMLDivElement>();

  const onSaveClick = async (yaml: string) => {
    onSave(yaml);
    setSaved(true);
  };

  React.useLayoutEffect(() => {
    if (yamlEditorRef.current?.clientHeight) {
      setEditorHeight(yamlEditorRef.current?.clientHeight - EDITOR_TOOLS_SPACES);
    }
  }, []);

  return (
    <div className="yaml-container">
      <div className="cloud-init-editor" ref={yamlEditorRef}>
        {editorHeight && (
          <ResourceYAMLEditor initialResource={dump(cloudInitData || '')} onSave={onSaveClick} />
        )}
      </div>
      {saved && (
        <Alert
          isInline
          className="co-alert"
          variant="success"
          title={t('Saved')}
          actionClose={<AlertActionCloseButton onClose={() => setSaved(false)} />}
        />
      )}
      <Divider />
    </div>
  );
};
