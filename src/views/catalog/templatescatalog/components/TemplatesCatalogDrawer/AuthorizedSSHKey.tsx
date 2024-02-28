import React, { FC, useCallback, useEffect, useMemo } from 'react';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import SSHSecretModal from '@kubevirt-utils/components/SSHSecretModal/SSHSecretModal';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import {
  addSecretToVM,
  removeSecretToVM,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInitialSSHDetails } from '@kubevirt-utils/resources/secret/utils';
import { getVMSSHSecretName } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DescriptionList, HelperText, HelperTextItem, SplitItem } from '@patternfly/react-core';

import { useDrawerContext } from './hooks/useDrawerContext';

type AuthorizedSSHKeyProps = {
  authorizedSSHKey: string;
  namespace: string;
};
const AuthorizedSSHKey: FC<AuthorizedSSHKeyProps> = ({ authorizedSSHKey, namespace }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { setSSHDetails, setVM, sshDetails, template, vm } = useDrawerContext();

  const vmAttachedSecretName = useMemo(() => getVMSSHSecretName(vm), [vm]);
  const secretName = authorizedSSHKey || vmAttachedSecretName;

  const additionalSecretResource: IoK8sApiCoreV1Secret = template?.objects?.find(
    (object) => object?.kind === SecretModel.kind,
  );

  const onSSHChange = useCallback(
    (details: SSHSecretDetails) => {
      const { secretOption, sshPubKey, sshSecretName } = details;

      if (isEqualObject(details, sshDetails)) {
        return;
      }

      if (
        secretOption === SecretSelectionOption.none &&
        sshDetails?.secretOption !== SecretSelectionOption.none
      ) {
        setVM(removeSecretToVM(vm));
      }

      if (
        secretOption === SecretSelectionOption.useExisting &&
        sshDetails?.sshSecretName !== sshSecretName &&
        !isEmpty(sshSecretName)
      ) {
        setVM(addSecretToVM(vm, sshSecretName));
      }

      if (
        secretOption === SecretSelectionOption.addNew &&
        !isEmpty(sshPubKey) &&
        !isEmpty(sshSecretName)
      ) {
        setVM(addSecretToVM(vm, sshSecretName));
      }

      setSSHDetails(details);
      return Promise.resolve();
    },
    [sshDetails, setVM, vm, setSSHDetails],
  );

  useEffect(() => {
    if (isEmpty(sshDetails)) {
      const initialSSHDetails = getInitialSSHDetails({
        applyKeyToProject: !isEmpty(authorizedSSHKey),
        secretToCreate:
          isEmpty(authorizedSSHKey) && !isEmpty(additionalSecretResource)
            ? additionalSecretResource
            : null,
        sshSecretName: secretName,
      });

      onSSHChange(initialSSHDetails);
    }
  }, [additionalSecretResource, authorizedSSHKey, onSSHChange, secretName, sshDetails]);

  return (
    <SplitItem>
      <DescriptionList className="pf-c-description-list">
        <VirtualMachineDescriptionItem
          onEditClick={() =>
            createModal((modalProps) => (
              <SSHSecretModal
                {...modalProps}
                initialSSHSecretDetails={sshDetails}
                namespace={namespace}
                onSubmit={onSSHChange}
              />
            ))
          }
          descriptionData={sshDetails?.sshSecretName || t('Not configured')}
          descriptionHeader={t('Public SSH key')}
          isEdit
        />
        {!isEmpty(additionalSecretResource) && (
          <HelperText>
            <HelperTextItem hasIcon variant="warning">
              {t('This key will override the SSH key secret set on the template')}
            </HelperTextItem>
          </HelperText>
        )}
      </DescriptionList>
    </SplitItem>
  );
};

export default AuthorizedSSHKey;
