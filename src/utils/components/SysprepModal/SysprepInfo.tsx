import React, { FC } from 'react';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';

const SysprepInfo: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div data-test="sysprep-info">
      <Stack>
        <StackItem>
          <Content className="kv-sysprep-info" component={ContentVariants.p}>
            {t(
              'Sysprep is an automation tool for Windows that automates Windows setup, and custom software provisioning.',
            )}
          </Content>
        </StackItem>
        <StackItem className="text-muted">
          {t(
            'An answer file is an XML-based file that contains setting definitions and values to use during Windows Setup',
          )}{' '}
          <Button
            icon={<ExternalLinkSquareAltIcon />}
            iconPosition="right"
            isInline
            size="sm"
            variant={ButtonVariant.link}
          >
            <a href={documentationURL.SYSPREP} rel="noopener noreferrer" target="_blank">
              {t('Learn more')}
            </a>
          </Button>
        </StackItem>
      </Stack>
    </div>
  );
};

export default SysprepInfo;
