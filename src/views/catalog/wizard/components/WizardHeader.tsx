import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title } from '@patternfly/react-core';

export const WizardHeader: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <StackItem className="co-m-nav-title co-m-nav-title--row">
      <Stack>
        <Title className="co-m-pane__heading" headingLevel="h1">
          {t('Review and Create VirtualMachine')}
        </Title>
        <Trans t={t} ns="plugin__kubevirt-plugin">
          You can click the Create VirtualMachine button to create your VirtualMachine or customize
          it by editing each of the tabs below. When done, click the Create Virtual Machine button.
        </Trans>
      </Stack>
    </StackItem>
  );
};
