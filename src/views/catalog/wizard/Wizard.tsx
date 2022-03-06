import * as React from 'react';
import { useParams } from 'react-router-dom';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import { useWizardVMContext } from '../utils/WizardVMContext';

import { WizardEmptyState } from './components/WizardEmptyState';
import { WizardFooter } from './components/WizardFooter';
import { WizardHeader } from './components/WizardHeader';
import { wizardNavPages } from './tabs';

import './Wizard.scss';

const Wizard: React.FC = () => {
  const { ns } = useParams<{ ns: string }>();
  const { vm, loaded } = useWizardVMContext();

  if (loaded && !vm) return <WizardEmptyState namespace={ns} />;

  return (
    <Stack hasGutter>
      <WizardHeader />
      <StackItem className="vm-wizard-body" isFilled>
        <HorizontalNav pages={wizardNavPages} />
      </StackItem>
      <WizardFooter namespace={ns} />
    </Stack>
  );
};
export default Wizard;
