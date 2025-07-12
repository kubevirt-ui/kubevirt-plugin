import React, { FC, ReactNode, useState } from 'react';

import { Button, FlexItem, Tooltip } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

type CloudInitCredentialsItemProps = {
  'button-data-test'?: string;
  copyButtons: ReactNode;
  credentials: ReactNode;
  credentialTitle: string;
  hideCredentialText: string;
  showCredentialText: string;
};

const CloudInitCredentialsItem: FC<CloudInitCredentialsItemProps> = ({
  'button-data-test': buttonDataTest,
  copyButtons,
  credentials,
  credentialTitle,
  hideCredentialText,
  showCredentialText,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FlexItem spacer={{ default: 'spacerSm' }}>
      {credentialTitle}{' '}
      {isVisible ? (
        <code className="cloud-init-credentials-inline-code">{credentials}</code>
      ) : (
        '●●●●●●●●●'
      )}{' '}
      {copyButtons}{' '}
      <Tooltip content={isVisible ? hideCredentialText : showCredentialText}>
        <Button
          data-test={buttonDataTest}
          icon={isVisible ? <EyeSlashIcon /> : <EyeIcon />}
          onClick={() => setIsVisible(!isVisible)}
          variant="plain"
        />
      </Tooltip>
    </FlexItem>
  );
};

export default CloudInitCredentialsItem;
