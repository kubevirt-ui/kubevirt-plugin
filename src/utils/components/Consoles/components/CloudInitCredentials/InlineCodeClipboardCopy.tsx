import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClipboardCopy } from '@patternfly/react-core';

const InlineCodeClipboardCopy: FC<{ clipboardText: string }> = ({ clipboardText }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ClipboardCopy
        clickTip={t('Copied')}
        hoverTip={t('Copy to clipboard')}
        isCode
        variant="inline-compact"
      >
        {clipboardText}
      </ClipboardCopy>{' '}
    </>
  );
};

export default InlineCodeClipboardCopy;
