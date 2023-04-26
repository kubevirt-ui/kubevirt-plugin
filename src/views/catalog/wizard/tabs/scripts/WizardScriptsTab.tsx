import * as React from 'react';

import { WizardDescriptionItem } from '@catalog/wizard/components/WizardDescriptionItem';
import { WizardTab } from '@catalog/wizard/tabs';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  Alert,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  Divider,
  PageSection,
} from '@patternfly/react-core';

import SSHKey from './components/SSHKey';
import Sysprep from './components/Sysprep';

import './WizardScriptsTab.scss';

const WizardScriptsTab: WizardTab = ({ vm, updateVM }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <PageSection className="wizard-scripts-tab">
      <SidebarEditor
        resource={vm}
        onResourceUpdate={(newVM) => updateVM(newVM)}
        pathsToHighlight={PATHS_TO_HIGHLIGHT.SCRIPTS_TAB}
      >
        <SidebarEditorSwitch />
        <DescriptionList className="wizard-scripts-tab__description-list">
          <DescriptionListDescription>
            <Alert
              className="scripts-alert"
              title={t(
                'Cloud-init and SSH key configurations will be applied to the VirtualMachine only at the first boot.',
              )}
              isInline
              variant={AlertVariant.warning}
            >
              {t(
                'Please, make sure the configuration is correct before starting the VirtualMachine.',
              )}
            </Alert>
          </DescriptionListDescription>
          <WizardDescriptionItem
            testId="wizard-cloudinit"
            title={t('Cloud-init')}
            description={<CloudInitDescription vm={vm} />}
            isEdit
            showEditOnTitle
            onEditClick={() =>
              createModal((modalProps) => (
                <CloudinitModal {...modalProps} vm={vm} onSubmit={updateVM} />
              ))
            }
          />
          <Divider />
          <SSHKey />
          <Divider />
          <Sysprep />
        </DescriptionList>
      </SidebarEditor>
    </PageSection>
  );
};

export default WizardScriptsTab;
