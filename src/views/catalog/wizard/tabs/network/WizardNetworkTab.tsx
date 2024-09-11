import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { ListPageBody, ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';

import NetworkInterfaceList from './components/list/NetworkInterfaceList';
import WizardNetworkInterfaceModal from './components/modal/WizardNetworkInterfaceModal';

const WizardNetworkTab: WizardTab = ({ updateVM, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const actionText = t('Add network interface');

  return (
    <PageSection variant={PageSectionVariants.light}>
      <ListPageBody>
        <SidebarEditor
          onResourceUpdate={(newVM) => updateVM(newVM)}
          pathsToHighlight={PATHS_TO_HIGHLIGHT.NETWORK_TAB}
          resource={vm}
        >
          <ListPageCreateButton
            onClick={() =>
              createModal(({ isOpen, onClose }) => (
                <WizardNetworkInterfaceModal
                  headerText={actionText}
                  isOpen={isOpen}
                  onClose={onClose}
                  updateVM={updateVM}
                  vm={vm}
                />
              ))
            }
            className="list-page-create-button-margin"
          >
            {actionText}
          </ListPageCreateButton>

          <NetworkInterfaceList vm={vm} />
        </SidebarEditor>
      </ListPageBody>
    </PageSection>
  );
};

export default WizardNetworkTab;
