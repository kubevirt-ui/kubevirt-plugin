import { useCallback, useEffect, useState } from 'react';

import { useDrawerContext } from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/hooks/useDrawerContext';
import { TemplateSSHDetails } from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/hooks/useTemplateSecrets/utils/types';
import { getTemplateSSHSecret } from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/hooks/useTemplateSecrets/utils/utils';
import {
  getSecretByNameAndNS,
  getSSHSecretCopy,
  sshSecretExistsInNamespace,
} from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/utils';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import useSecretsData from '@kubevirt-utils/components/SSHSecretModal/hooks/useSecretsData';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import {
  addSecretToVM,
  removeSecretFromVM,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { getInitialSSHDetails } from '@kubevirt-utils/resources/secret/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';

type UseTemplateSecrets = (
  namespaceDefaultSecretName: string,
  targetNamespace: string,
  cluster?: string,
) => {
  copyTemplateSecretToTargetNS: boolean;
  onSSHChange: (details: SSHSecretDetails) => Promise<void>;
  overwriteTemplateSSHKey: boolean;
  sshDetails: SSHSecretDetails;
};

const useTemplateSecrets: UseTemplateSecrets = (
  namespaceDefaultSecretName,
  targetNamespace,
  cluster,
) => {
  const { setSSHDetails, setVM, sshDetails, template, vm } = useDrawerContext();

  const [templateSecretDetails] = useState<TemplateSSHDetails>(getTemplateSSHSecret(template));
  const { templateSecretName, templateSecretNamespace } = templateSecretDetails;

  const secretsData = useSecretsData(targetNamespace, templateSecretNamespace, cluster);
  const templateSecret: IoK8sApiCoreV1Secret = getSecretByNameAndNS(
    templateSecretName,
    templateSecretNamespace,
    secretsData?.projectsWithSecrets,
  );

  const secretName = namespaceDefaultSecretName || templateSecretName;

  const templateSecretExistsInTargetNS = sshSecretExistsInNamespace(
    secretsData,
    templateSecretNamespace,
    targetNamespace,
    templateSecretName,
  );
  const copyTemplateSecretToTargetNS =
    secretName === templateSecretName && !templateSecretExistsInTargetNS;

  const onSSHChange = useCallback(
    (newSSHDetails: SSHSecretDetails) => {
      const { secretOption, sshPubKey, sshSecretName } = newSSHDetails;

      if (isEqualObject(newSSHDetails, sshDetails)) return;

      const removeCurrentSecretFromVM =
        secretOption === SecretSelectionOption.none &&
        sshDetails?.secretOption !== SecretSelectionOption.none;

      const addExistingSecretToVM =
        secretOption === SecretSelectionOption.useExisting &&
        sshDetails?.sshSecretName !== sshSecretName &&
        !isEmpty(sshSecretName);

      const addNewSecretToVM =
        secretOption === SecretSelectionOption.addNew &&
        !isEmpty(sshPubKey) &&
        !isEmpty(sshSecretName);

      if (removeCurrentSecretFromVM) setVM(removeSecretFromVM(vm));

      if (addExistingSecretToVM || addNewSecretToVM) setVM(addSecretToVM(vm, sshSecretName));

      setSSHDetails(newSSHDetails);
      return Promise.resolve();
    },
    [sshDetails, setVM, vm, setSSHDetails],
  );

  useEffect(() => {
    if (isEmpty(sshDetails) || !secretsData?.secretsLoaded) {
      const initialSSHDetails = getInitialSSHDetails({
        applyKeyToProject: !isEmpty(namespaceDefaultSecretName),
        secretToCreate: copyTemplateSecretToTargetNS
          ? getSSHSecretCopy(templateSecret, targetNamespace)
          : null,
        sshSecretName: secretName,
        sshSecretNamespace: targetNamespace,
      });

      onSSHChange(initialSSHDetails);
    }
  }, [
    namespaceDefaultSecretName,
    onSSHChange,
    secretsData.secretsLoaded,
    secretName,
    sshDetails,
    copyTemplateSecretToTargetNS,
    templateSecret,
    targetNamespace,
  ]);

  return {
    copyTemplateSecretToTargetNS,
    onSSHChange,
    overwriteTemplateSSHKey: !isEmpty(namespaceDefaultSecretName) && !isEmpty(templateSecretName),
    sshDetails,
  };
};

export default useTemplateSecrets;
