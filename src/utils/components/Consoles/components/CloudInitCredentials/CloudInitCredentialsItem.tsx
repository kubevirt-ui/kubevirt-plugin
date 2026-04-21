import React, { FC, useState } from 'react';

import useHideCredentials from '@kubevirt-utils/hooks/useHideCredentials/useHideCredentials';
import { Button, Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import InlineCodeClipboardCopy from './InlineCodeClipboardCopy';

type CloudInitCredentialsItemProps = {
  'button-data-test'?: string;
  credentials: string;
  credentialTitle: string;
  hideCredentialText: string;
  showCredentialText: string;
};

const CloudInitCredentialsItem: FC<CloudInitCredentialsItemProps> = ({
  'button-data-test': buttonDataTest,
  credentials,
  credentialTitle,
  hideCredentialText,
  showCredentialText,
}) => {
  const [isCredentialsVisible, setIsCredentialsVisible] = useState(false);
  const { shouldHideCredentials } = useHideCredentials();

  return (
    <>
      <Flex display={{ default: 'inlineFlex' }} spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>{credentialTitle}</FlexItem>
        <InlineCodeClipboardCopy
          clipboardText={credentials}
          isCredentialsVisible={isCredentialsVisible}
        />
        {!shouldHideCredentials && (
          <Tooltip content={isCredentialsVisible ? hideCredentialText : showCredentialText}>
            <Button
              data-test={buttonDataTest}
              icon={isCredentialsVisible ? <EyeSlashIcon /> : <EyeIcon />}
              onClick={() => setIsCredentialsVisible(!isCredentialsVisible)}
              variant="plain"
            />
          </Tooltip>
        )}
      </Flex>
    </>
  );
};

export default CloudInitCredentialsItem;
