import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem, Title } from '@patternfly/react-core';

import { useWizardTemplateContext } from '../utils/WizardTemplateContext';

import { wizardNavPages } from './tabs';

const Wizard: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const { template } = useWizardTemplateContext();

  return (
    <Stack hasGutter>
      <StackItem className="co-m-nav-title co-m-nav-title--row">
        <Stack>
          <Title className="co-m-pane__heading" headingLevel="h1">
            {t('Review and Create VirtualMachine')}
          </Title>
          <Trans t={t} ns="plugin__kubevirt-plugin">
            You can click the Create Virtual Machine button to create your Virtual Machine or
            customize it by editing each of the tabs below. When done, click the Create Virtual
            Machine button.
          </Trans>
        </Stack>
      </StackItem>
      <StackItem>
        <HorizontalNav pages={wizardNavPages} resource={template} />
      </StackItem>
    </Stack>
  );
};
export default Wizard;
