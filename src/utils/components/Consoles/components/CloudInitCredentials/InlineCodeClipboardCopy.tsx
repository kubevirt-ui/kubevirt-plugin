import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClipboardCopy } from '@patternfly/react-core';

import { clipboardCopyFunc } from '../../utils/utils';

const InlineCodeClipboardCopy: FC<{ clipboardText: string }> = ({ clipboardText }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ClipboardCopy
        clickTip={t('Copied')}
        hoverTip={t('Copy to clipboard')}
        isCode
        onCopy={clipboardCopyFunc}
        variant="inline-compact"
      >
        {clipboardText}
      </ClipboardCopy>{' '}
    </>
  );
};

export default InlineCodeClipboardCopy;
