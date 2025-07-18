import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClipboardCopy } from '@patternfly/react-core';

type InlineCodeClipboardCopyProps = {
  clipboardText: string;
  hideText?: boolean;
};

const InlineCodeClipboardCopy: FC<InlineCodeClipboardCopyProps> = ({
  clipboardText,
  hideText = false,
}) => {
  const { t } = useKubevirtTranslation();

  const handleCopy = () => {
    navigator.clipboard.writeText(clipboardText);
  };

  return (
    <>
      <ClipboardCopy
        clickTip={t('Copied')}
        hoverTip={t('Copy to clipboard')}
        isCode
        onCopy={handleCopy}
        style={hideText ? { backgroundColor: 'transparent' } : undefined}
        variant="inline-compact"
      >
        {hideText ? '' : clipboardText}
      </ClipboardCopy>{' '}
    </>
  );
};

export default InlineCodeClipboardCopy;
