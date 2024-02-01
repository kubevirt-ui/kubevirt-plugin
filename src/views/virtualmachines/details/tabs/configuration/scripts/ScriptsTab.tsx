import React, { FC, useCallback, useMemo } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AlertScripts from '@kubevirt-utils/components/AlertScripts/AlertScripts';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SecretNameLabel from '@kubevirt-utils/components/SSHSecretSection/components/SecretNameLabel/SecretNameLabel';
import VMSSHSecretModal from '@kubevirt-utils/components/SSHSecretSection/VMSSHSecretModal';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { asAccessReview, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  k8sUpdate,
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListDescription,
  Divider,
  PageSection,
  Stack,
} from '@patternfly/react-core';

import { ConfigurationInnerTabProps } from '../utils/types';

import DynamicSSHKeyInjectionDescription from './components/DynamicSSHKeyInjectionDescription';
import VirtualMachineScriptsTabSysprep from './components/VirtualMachineScriptsTabSysprep';
import { useDynamicSSHInjection } from './hooks/useDynamicSSHInjection';

import './scripts-tab.scss';

const ScriptsTab: FC<ConfigurationInnerTabProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys, loaded] = useKubevirtUserSettings('ssh');
  const secretName = useMemo(() => getVMSSHSecretName(vm), [vm]);
  const isDynamicSSHInjectionEnabled = useDynamicSSHInjection(vm);
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});
  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: getName(vm),
    namespace: getNamespace(vm),
  });

  const onSubmit = useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        data: updatedVM,
        model: VirtualMachineModel,
        name: updatedVM?.metadata?.name,
        ns: updatedVM?.metadata?.namespace,
      }),
    [],
  );

  return (
    <PageSection>
      <SidebarEditor
        onResourceUpdate={onSubmit}
        pathsToHighlight={PATHS_TO_HIGHLIGHT.SCRIPTS_TAB}
        resource={vm}
      >
        {(resource) => (
          <DescriptionList className="vm-scripts-tab">
            <DescriptionListDescription>
              <AlertScripts />
            </DescriptionListDescription>
            <VirtualMachineDescriptionItem
              onEditClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <CloudinitModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onSubmit={onSubmit}
                    vm={resource}
                    vmi={vmi}
                  />
                ))
              }
              descriptionData={<CloudInitDescription vm={resource} />}
              descriptionHeader={t('Cloud-init')}
              isEdit={canUpdateVM}
              showEditOnTitle
            />
            <Divider />
            <VirtualMachineDescriptionItem
              descriptionData={
                <Stack hasGutter>
                  <div data-test="ssh-popover">
                    {isDynamicSSHInjectionEnabled ? (
                      <>{t('Store the key in a project secret.')}</>
                    ) : (
                      <DynamicSSHKeyInjectionDescription />
                    )}
                  </div>
                  <SecretNameLabel secretName={secretName} />
                </Stack>
              }
              onEditClick={() =>
                createModal((modalProps) => (
                  <VMSSHSecretModal
                    {...modalProps}
                    authorizedSSHKeys={authorizedSSHKeys}
                    updateAuthorizedSSHKeys={updateAuthorizedSSHKeys}
                    updateVM={onSubmit}
                    vm={vm}
                  />
                ))
              }
              data-test-id="authorized-ssh-key-button"
              descriptionHeader={t('Authorized SSH key')}
              isDisabled={!loaded || !isDynamicSSHInjectionEnabled}
              isEdit={canUpdateVM}
              label={<LinuxLabel />}
              showEditOnTitle
            />
            <Divider />
            <VirtualMachineScriptsTabSysprep canUpdateVM={canUpdateVM} vm={vm} />
          </DescriptionList>
        )}
      </SidebarEditor>
    </PageSection>
  );
};

export default ScriptsTab;
