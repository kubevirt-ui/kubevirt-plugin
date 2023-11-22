import * as React from 'react';
import { useParams } from 'react-router-dom';

import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
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
  const { vm } = useWizardVMContext();

  if (!vm) return <WizardEmptyState namespace={ns} />;

  return (
    <SidebarEditorProvider>
      <Stack hasGutter>
        <WizardHeader namespace={ns} />
        <StackItem className="vm-wizard-body" isFilled>
          <HorizontalNav pages={wizardNavPages} />
        </StackItem>
        <WizardFooter namespace={ns} />
      </Stack>
    </SidebarEditorProvider>
  );
};
export default Wizard;
