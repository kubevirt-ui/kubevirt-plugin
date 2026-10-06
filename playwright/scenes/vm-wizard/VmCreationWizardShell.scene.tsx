import type { JSX } from 'react';

import VMCreationWizard from 'src/views/virtualmachines/wizard/VMCreationWizard';

import { VirtSceneScaffold } from '../shared/VirtSceneScaffold';

const WIZARD_ENTRY = '/vm-wizard';

export const Default = (): JSX.Element => (
  <VirtSceneScaffold initialEntries={[WIZARD_ENTRY]} initialPreset="populated">
    <div data-test="scene-vm-creation-wizard">
      <span className="pf-v6-u-screen-reader" data-test="story-surface">
        VmCreationWizardShell
      </span>
      <VMCreationWizard />
    </div>
  </VirtSceneScaffold>
);
