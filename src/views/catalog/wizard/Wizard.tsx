import React, { FCC } from 'react';
import { useParams } from 'react-router';

import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import { Stack, StackItem } from '@patternfly/react-core';

import { useWizardVMContext } from '../utils/WizardVMContext';

import { WizardEmptyState } from './components/WizardEmptyState';
import { WizardFooter } from './components/WizardFooter';
import { WizardHeader } from './components/WizardHeader';
import { wizardNavPages } from './tabs';

import './Wizard.scss';

const Wizard: FCC = () => {
  const { ns } = useParams<{ ns: string }>();
  const { vm } = useWizardVMContext();

  if (!vm) return <WizardEmptyState namespace={ns} />;

  return (
    <SidebarEditorProvider>
      <Stack hasGutter>
        <WizardHeader namespace={ns} />
        <StackItem className="vm-wizard-body" isFilled>
          <HorizontalNavbar loaded pages={wizardNavPages} vm={vm} />
        </StackItem>
        <WizardFooter namespace={ns} />
      </Stack>
    </SidebarEditorProvider>
  );
};
export default Wizard;
