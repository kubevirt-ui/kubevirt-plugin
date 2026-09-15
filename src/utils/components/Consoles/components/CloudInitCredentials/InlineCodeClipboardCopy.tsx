import { type FC, type ReactElement } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClipboardCopy } from '@patternfly/react-core';

import { writeToClipboard } from '../../utils/utils';
import { LINE_FEED } from '../vnc-console/utils/constants';

type InlineCodeClipboardCopyProps = {
  clipboardText: string;
  isCredentialsVisible?: boolean;
};

const InlineCodeClipboardCopy: FC<InlineCodeClipboardCopyProps> = ({
  clipboardText,
  isCredentialsVisible = false,
}): ReactElement => {
  const { t } = useKubevirtTranslation();

  const handleCopy = async (): Promise<void> => {
    await writeToClipboard(clipboardText.concat(String.fromCharCode(LINE_FEED)));
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
