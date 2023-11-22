import * as React from 'react';

import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { WizardTab } from '@catalog/wizard/tabs';
import AlertScripts from '@kubevirt-utils/components/AlertScripts/AlertScripts';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  DescriptionList,
  DescriptionListDescription,
  Divider,
  PageSection,
} from '@patternfly/react-core';

import DynamicSSHKeyInjectionWizard from './components/DynamicSSHKeyInjectionWizard';
import SSHKey from './components/SSHKey';
import Sysprep from './components/Sysprep';

import './WizardScriptsTab.scss';

const WizardScriptsTab: WizardTab = ({ updateVM, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <PageSection className="wizard-scripts-tab">
      <SidebarEditor
        onResourceUpdate={(newVM) => updateVM(newVM)}
        pathsToHighlight={PATHS_TO_HIGHLIGHT.SCRIPTS_TAB}
        resource={vm}
      >
        <DescriptionList className="wizard-scripts-tab__description-list">
          <DescriptionListDescription>
            <AlertScripts />
          </DescriptionListDescription>
          <WizardDescriptionItem
            onEditClick={() =>
              createModal((modalProps) => (
                <CloudinitModal {...modalProps} onSubmit={updateVM} vm={vm} />
              ))
            }
            description={<CloudInitDescription vm={vm} />}
            isEdit
            showEditOnTitle
            testId="wizard-cloudinit"
            title={t('Cloud-init')}
          />
          <Divider />
          <SSHKey />
          <Divider />
          <DynamicSSHKeyInjectionWizard />
          <Divider />
          <Sysprep />
        </DescriptionList>
      </SidebarEditor>
    </PageSection>
  );
};

export default WizardScriptsTab;
