import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import {
  addNewSecret,
  generateValidSecretName,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { SecretSelectionOption, SSHSecretDetails } from '../../utils/types';

type SecretDropdownProps = {
  namespace: string;
  onSelectSecret: (generatedSecretName: string) => void;
  selectedProject: string;
  selectedProjectSecrets: IoK8sApiCoreV1Secret[];
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SecretDropdown: FC<SecretDropdownProps> = ({
  namespace,
  onSelectSecret,
  selectedProject,
  selectedProjectSecrets,
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();

  const [secretName, setSecretName] = useState<string>(sshDetails?.sshSecretName);
  useEffect(
    () => isEmpty(sshDetails?.sshSecretName) && isEmpty(sshDetails.sshPubKey) && setSecretName(''),
    [sshDetails.sshPubKey, sshDetails?.sshSecretName],
  );

  const onSelect = (newSecretName: string) => {
    const selectedSecret = selectedProjectSecrets.find(
      (secret: IoK8sApiCoreV1Secret) => getName(secret) === newSecretName,
    );
    const addNew = addNewSecret(namespace, selectedProject, activeNamespace);
    const sshPubKey = decodeSecret(selectedSecret);
    const generatedSecretName = generateValidSecretName(newSecretName);

    setSSHDetails((prev) => ({
      ...prev,
      secretOption: addNew ? SecretSelectionOption.addNew : SecretSelectionOption.useExisting,
      sshPubKey,
      sshSecretName: addNew ? generatedSecretName : newSecretName,
      sshSecretNamespace: selectedSecret?.metadata?.namespace,
    }));
    setSecretName(newSecretName);
    onSelectSecret(generatedSecretName);
  };

  return (
    <InlineFilterSelect
      options={selectedProjectSecrets?.map((secret: IoK8sApiCoreV1Secret) => {
        const name = getName(secret);
        return { children: name, value: name };
      })}
      selected={secretName}
      setSelected={onSelect}
      toggleProps={{ isFullWidth: true, placeholder: t('Select secret') }}
    />
  );
};

export default SecretDropdown;
