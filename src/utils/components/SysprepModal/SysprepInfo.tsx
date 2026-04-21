import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants, Stack, StackItem } from '@patternfly/react-core';

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
        <StackItem className="pf-v6-u-text-color-subtle">
          {t(
            'An answer file is an XML-based file that contains setting definitions and values to use during Windows Setup',
          )}{' '}
          <ExternalLink href={documentationURL.SYSPREP} text={t('Learn more')} />
        </StackItem>
      </Stack>
    </div>
  );
};

export default SysprepInfo;
