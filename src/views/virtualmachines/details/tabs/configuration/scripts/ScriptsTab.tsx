import * as React from 'react';
import { Trans } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { VMAuthorizedSSHKeyModal } from '@kubevirt-utils/components/VMAuthorizedSSHKeyModal/VMAuthorizedSSHKeyModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import {
  k8sUpdate,
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  Divider,
  PageSection,
  Stack,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import VirtualMachineDescriptionItem from '../../details/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

import './scripts-tab.scss';

type VirtualMachineScriptPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const ScriptsTab: React.FC<VirtualMachineScriptPageProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});
  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
    isList: false,
  });

  const hasSSHKey = vm?.spec?.template?.spec?.accessCredentials?.length > 0;

  const onSubmit = React.useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        model: VirtualMachineModel,
        data: updatedVM,
        ns: updatedVM?.metadata?.namespace,
        name: updatedVM?.metadata?.name,
      }),
    [],
  );

  return (
    <PageSection>
      <SidebarEditor resource={vm} onResourceUpdate={onSubmit}>
        {(resource) => (
          <DescriptionList className="vm-scripts-tab">
            <SidebarEditorSwitch />
            <VirtualMachineDescriptionItem
              descriptionData={<CloudInitDescription vm={resource} />}
              descriptionHeader={t('Cloud-init')}
              isEdit={canUpdateVM}
              showEditOnTitle
              onEditClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <CloudinitModal
                    vm={resource}
                    isOpen={isOpen}
                    onClose={onClose}
                    onSubmit={onSubmit}
                    vmi={vmi}
                  />
                ))
              }
            />
            <Divider />
            <VirtualMachineDescriptionItem
              descriptionData={
                <Stack hasGutter>
                  <div data-test="ssh-popover">
                    <Trans t={t} ns="plugin__kubevirt-plugin">
                      <Text component={TextVariants.p}>Store the key in a project secret.</Text>
                    </Trans>
                  </div>
                  <span>{hasSSHKey ? t('Available') : t('Not available')}</span>
                </Stack>
              }
              descriptionHeader={t('Authorized SSH Key')}
              isEdit={canUpdateVM}
              data-test-id="authorized-ssh-key-button"
              showEditOnTitle
              onEditClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <VMAuthorizedSSHKeyModal
                    vm={resource}
                    isOpen={isOpen}
                    onClose={onClose}
                    vmi={vmi}
                  />
                ))
              }
            />
          </DescriptionList>
        )}
      </SidebarEditor>
    </PageSection>
  );
};

export default ScriptsTab;
