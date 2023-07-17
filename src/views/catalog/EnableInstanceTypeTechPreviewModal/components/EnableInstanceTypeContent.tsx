import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Text, TextVariants } from '@patternfly/react-core';

const EnableInstanceTypeContent: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Trans ns="plugin__kubevirt-plugin" t={t}>
      <Stack hasGutter>
        <StackItem>
          <Text className="pf-u-font-size-xl pf-u-danger-color-100" component={TextVariants.p}>
            Creating a VirtualMachine is easier than ever!
          </Text>
        </StackItem>
        <StackItem>
          <Text component={TextVariants.p}>
            This{' '}
            <Text
              component={TextVariants.a}
              href="https://access.redhat.com/support/offerings/techpreview"
              target="_blank"
            >
              Technology Preview feature
            </Text>{' '}
            provides a simple way to create a VirtualMachine. You must have
            <Text component={TextVariants.p}>
              cluster admin permissions to enable this feature. You can disable it at any time on
              the Settings tab
            </Text>
            <Text component={TextVariants.p}>
              on the <b>Virtualization {'>'} Overview</b> page.
            </Text>
          </Text>
        </StackItem>
      </Stack>
    </Trans>
  );
};

export default EnableInstanceTypeContent;
