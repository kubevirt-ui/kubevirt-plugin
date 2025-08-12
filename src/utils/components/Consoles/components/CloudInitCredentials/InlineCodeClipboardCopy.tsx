import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClipboardCopy } from '@patternfly/react-core';

import { writeToClipboard } from '../../utils/utils';
import { LINE_FEED } from '../vnc-console/utils/util';

type InlineCodeClipboardCopyProps = {
  clipboardText: string;
  isCredentialsVisible?: boolean;
};

const InlineCodeClipboardCopy: FC<InlineCodeClipboardCopyProps> = ({
  clipboardText,
  isCredentialsVisible = false,
}) => {
  const { t } = useKubevirtTranslation();

  const handleCopy = () => {
    writeToClipboard(clipboardText.concat(String.fromCharCode(LINE_FEED)));
  };

  return (
    <ClipboardCopy
      clickTip={t('Copied')}
      hoverTip={t('Copy to clipboard')}
      isCode
      onCopy={handleCopy}
      variant="inline-compact"
    >
      {isCredentialsVisible ? clipboardText : '●●●●●●●●●'}
    </ClipboardCopy>
  );
};

export default InlineCodeClipboardCopy;
