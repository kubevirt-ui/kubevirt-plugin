import React, { FC, useLayoutEffect, useRef, useState } from 'react';

import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertActionCloseButton, AlertVariant, Divider } from '@patternfly/react-core';

import { getCloudInitData } from '../utils/cloudinit-utils';

import './CloudInitEditor.scss';

type CloudInitEditorProps = {
  cloudInitVolume: V1Volume;
  onSave: (yaml: string) => void;
};

const EDITOR_TOOLS_SPACES = 75;

export const _CloudInitEditor: FC<CloudInitEditorProps> = ({ cloudInitVolume, onSave }) => {
  const { t } = useKubevirtTranslation();
  const cloudInitData = getCloudInitData(cloudInitVolume);

  const [editorHeight, setEditorHeight] = useState<number>();
  const [saved, setSaved] = useState<boolean>(false);
  const yamlEditorRef = useRef<HTMLDivElement>();

  const onSaveClick = (yaml: string) => {
    onSave(yaml);
    setSaved(true);
  };

  useLayoutEffect(() => {
    if (yamlEditorRef.current?.clientHeight) {
      setEditorHeight(yamlEditorRef.current?.clientHeight - EDITOR_TOOLS_SPACES);
    }
  }, []);

  return (
    <div className="yaml-container">
      <div className="cloud-init-editor" ref={yamlEditorRef}>
        {editorHeight && (
          <ResourceYAMLEditor
            initialResource={cloudInitData as K8sResourceCommon}
            onSave={onSaveClick}
          />
        )}
      </div>
      {saved && (
        <Alert
          actionClose={<AlertActionCloseButton onClose={() => setSaved(false)} />}
          isInline
          title={t('Saved')}
          variant={AlertVariant.success}
        />
      )}
      <Divider />
    </div>
  );
};
