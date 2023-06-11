import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Stack, StackItem, Text, TextVariants } from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

import { SYSPREP_DOC_URL } from './consts';

const SysprepInfo: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <div data-test="sysprep-info">
      <Stack>
        <StackItem>
          <Text className="kv-sysprep-info" component={TextVariants.p}>
            {t(
              'Sysprep is an automation tool for Windows that automates Windows setup, and custom software provisioning.',
            )}
          </Text>
        </StackItem>
        <StackItem className="text-muted">
          {t(
            'An answer file is an XML-based file that contains setting definitions and values to use during Windows Setup',
          )}{' '}
          <Button
            icon={<ExternalLinkSquareAltIcon />}
            iconPosition="right"
            isInline
            isSmall
            variant="link"
          >
            <a href={SYSPREP_DOC_URL} rel="noopener noreferrer" target="_blank">
              {t('Learn more')}
            </a>
          </Button>
        </StackItem>
      </Stack>
    </div>
  );
};

export default SysprepInfo;
