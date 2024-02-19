import React, { ClipboardEvent, FC, MouseEventHandler, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, clipboardCopyFunc, Tooltip } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';

import './SimpleCopyButton.scss';

type SimpleCopyButtonProps = {
  textToCopy: string;
};

const SimpleCopyButton: FC<SimpleCopyButtonProps> = ({ textToCopy }) => {
  const { t } = useKubevirtTranslation();
  const [copiedState, setCopiedState] = useState<boolean>(false);

  const handleClick = (event: ClipboardEvent<HTMLInputElement>) => {
    clipboardCopyFunc(event, textToCopy);
    setCopiedState(true);
  };

  return (
    <Tooltip
      aria="none"
      aria-live="polite"
      content={copiedState ? <div>{t('Copied')}</div> : <div>{t('Copy to clipboard')}</div>}
      entryDelay={300}
      exitDelay={0}
      maxWidth="150px"
      onTooltipHidden={() => setCopiedState(false)}
      position="top"
      trigger="mouseenter focus click"
    >
      <Button
        aria-label="Copy text to clipboard"
        icon={<CopyIcon />}
        id="kubevirt-simple-copy-button__button"
        onClick={handleClick as unknown as MouseEventHandler<HTMLButtonElement>}
      />
    </Tooltip>
  );
};

export default SimpleCopyButton;
