import React, { useMemo, useState } from 'react';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SecretNameLabel from '@kubevirt-utils/components/SSHSecretSection/components/SecretNameLabel/SecretNameLabel';
import VMSSHSecretModal from '@kubevirt-utils/components/SSHSecretSection/VMSSHSecretModal';
import EditButtonWithTooltip from '@kubevirt-utils/components/VirtualMachineDescriptionItem/EditButtonWithTooltip';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { k8sUpdate, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableSection, Stack } from '@patternfly/react-core';

import { useDynamicSSHInjection } from '../hooks/useDynamicSSHInjection';

import DynamicSSHKeyInjectionDescription from './DynamicSSHKeyInjectionDescription';

const SSHTabAuthorizedSSHKey = ({ vm }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>();
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys, loaded] = useKubevirtUserSettings('ssh');
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});
  const secretName = useMemo(() => getVMSSHSecretName(vm), [vm]);
  const isDynamicSSHInjectionEnabled = useDynamicSSHInjection(vm);

  const onSubmit = (updatedVM: V1VirtualMachine) =>
    k8sUpdate({
      data: updatedVM,
      model: VirtualMachineModel,
      name: updatedVM?.metadata?.name,
      ns: updatedVM?.metadata?.namespace,
    });

  return (
    <ExpandableSection
      toggleContent={
        <div>
          {t('Authorized ssh key')} <LinuxLabel />{' '}
          <EditButtonWithTooltip
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
            isEditable={canUpdateVM && loaded && isDynamicSSHInjectionEnabled}
            testId="ssh-tab-edit-authorized"
          >
            {t('Edit')}
          </EditButtonWithTooltip>
        </div>
      }
      isExpanded={isExpanded}
      isIndented
      onToggle={setIsExpanded}
    >
      <Stack hasGutter>
        <DynamicSSHKeyInjectionDescription isDynamicSSHInjectionEnabled />
        <SecretNameLabel secretName={secretName} />
      </Stack>
    </ExpandableSection>
  );
};

export default SSHTabAuthorizedSSHKey;
