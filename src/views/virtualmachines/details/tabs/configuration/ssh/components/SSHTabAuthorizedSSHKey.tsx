import React, { FC, useMemo, useState } from 'react';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SecretNameLabel from '@kubevirt-utils/components/SSHSecretModal/components/SecretNameLabel';
import EditButtonWithTooltip from '@kubevirt-utils/components/VirtualMachineDescriptionItem/EditButtonWithTooltip';
import VMSSHSecretModal from '@kubevirt-utils/components/VMSSHSecretModal/VMSSHSecretModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { k8sUpdate, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableSection, Stack } from '@patternfly/react-core';

import { useDynamicSSHInjection } from '../hooks/useDynamicSSHInjection';

import DynamicSSHKeyInjectionDescription from './DynamicSSHKeyInjectionDescription';

type SSHTabAuthorizedSSHKeyProps = {
  isCustomizeInstanceType?: boolean;
  onUpdateVM?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};
const SSHTabAuthorizedSSHKey: FC<SSHTabAuthorizedSSHKeyProps> = ({
  isCustomizeInstanceType,
  onUpdateVM,
  vm,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>();
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys, loaded] = useKubevirtUserSettings('ssh');
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});
  const secretName = useMemo(() => getVMSSHSecretName(vm), [vm]);
  const isDynamicSSHInjectionEnabled = useDynamicSSHInjection(vm);
  const isEditable =
    ((canUpdateVM && isDynamicSSHInjectionEnabled) || isCustomizeInstanceType) && loaded;

  const onSubmit = (updatedVM: V1VirtualMachine) =>
    onUpdateVM
      ? onUpdateVM(updatedVM)
      : k8sUpdate({
          data: updatedVM,
          model: VirtualMachineModel,
          name: updatedVM?.metadata?.name,
          ns: updatedVM?.metadata?.namespace,
        });

  return (
    <ExpandableSection
      toggleContent={
        <div>
          <SearchItem id="public-ssh-key">{t('Public SSH key')}</SearchItem> <LinuxLabel />{' '}
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
            isEditable={isEditable}
            testId="ssh-tab-edit-authorized"
          >
            {t('Edit')}
          </EditButtonWithTooltip>
        </div>
      }
      isExpanded={isExpanded}
      isIndented
      onToggle={(_event, val) => setIsExpanded(val)}
    >
      <Stack hasGutter>
        <SecretNameLabel secretName={secretName} />
        <DynamicSSHKeyInjectionDescription isDynamicSSHInjectionEnabled />
      </Stack>
    </ExpandableSection>
  );
};

export default SSHTabAuthorizedSSHKey;
