import React, { FC, useState } from 'react';
import { saveAs } from 'file-saver';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Tooltip } from '@patternfly/react-core';
import { CopyIcon, DownloadIcon } from '@patternfly/react-icons';

type YamlAndCLIEditorProps = {
  code: string;
  minHeight: number;
};

const YamlAndCLIEditor: FC<YamlAndCLIEditorProps> = ({ code, minHeight }) => {
  const { t } = useKubevirtTranslation();
  const [copySuccess, setCopySuccess] = useState(false);
  const handleDownload = () => {
    // Download the code as a file
    const blob = new Blob([code], { type: 'text/plain' });
    saveAs(blob, 'code.txt');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  return (
    <YAMLEditor
      toolbarLinks={[
        <Tooltip content={t('Download')} key="download">
          <Button onClick={handleDownload} variant="secondary">
            <DownloadIcon />
          </Button>
        </Tooltip>,
        <Tooltip
          content={copySuccess ? t('Successfully copied to clipboard!') : t('Copy to clipboard')}
          key="copy"
        >
          <Button onClick={handleCopy} variant="secondary">
            <CopyIcon />
          </Button>
        </Tooltip>,
      ]}
      minHeight={minHeight}
      options={{ readOnly: true }}
      showShortcuts
      value={code}
    />
  );
};

export default YamlAndCLIEditor;
