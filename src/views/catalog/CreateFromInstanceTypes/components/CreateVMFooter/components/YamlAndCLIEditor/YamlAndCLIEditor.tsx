import React, { FC, useState } from 'react';
import { saveAs } from 'file-saver';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { CopyIcon, DownloadIcon } from '@patternfly/react-icons';

type YamlAndCLIEditorProps = {
  code: string;
  minHeight: string;
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
          <Button
            icon={<DownloadIcon />}
            onClick={handleDownload}
            variant={ButtonVariant.secondary}
          />
        </Tooltip>,
        <Tooltip
          content={copySuccess ? t('Successfully copied to clipboard!') : t('Copy to clipboard')}
          key="copy"
        >
          <Button icon={<CopyIcon />} onClick={handleCopy} variant={ButtonVariant.secondary} />
        </Tooltip>,
      ]}
      minHeight={minHeight?.toString()}
      options={{ readOnly: true }}
      showShortcuts
      value={code}
    />
  );
};

export default YamlAndCLIEditor;
