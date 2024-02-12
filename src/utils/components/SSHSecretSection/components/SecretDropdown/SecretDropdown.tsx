import React, {
  ChangeEvent,
  Dispatch,
  FC,
  MouseEvent,
  ReactElement,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { generateValidSecretName } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { SecretSelectionOption, SSHSecretDetails } from '../../utils/types';

type SecretDropdownProps = {
  id?: string;
  namespace: string;
  onSelectSecret: (generatedSecretName: string) => void;
  secretsResourceData: IoK8sApiCoreV1Secret[];
  selectedProject: string;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SecretDropdown: FC<SecretDropdownProps> = ({
  id,
  namespace,
  onSelectSecret,
  secretsResourceData,
  selectedProject,
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeNamespace] = useActiveNamespace();

  const [secretName, setSecretName] = useState<string>(sshDetails?.sshSecretName);
  useEffect(
    () => isEmpty(sshDetails?.sshSecretName) && isEmpty(sshDetails.sshPubKey) && setSecretName(''),
    [sshDetails.sshPubKey, sshDetails?.sshSecretName],
  );

  const onSelect = (_: MouseEvent, newSecretName: string) => {
    const selectedSecret = secretsResourceData.find(
      (secret: IoK8sApiCoreV1Secret) => getName(secret) === newSecretName,
    );
    const addNew = namespace ? selectedProject !== namespace : selectedProject !== activeNamespace;
    const sshPubKey = decodeSecret(selectedSecret);
    const generatedSecretName = generateValidSecretName(newSecretName);

    setSSHDetails((prev) => ({
      ...prev,
      secretOption: addNew ? SecretSelectionOption.addNew : SecretSelectionOption.useExisting,
      sshPubKey,
      sshSecretName: generatedSecretName,
      sshSecretNamespace: selectedSecret?.metadata?.namespace,
    }));
    setSecretName(newSecretName);
    setIsOpen(false);
    onSelectSecret(generatedSecretName);
  };

  const filterSecrets = (_: ChangeEvent<HTMLInputElement>, userInput: string): ReactElement[] =>
    secretsResourceData
      ?.filter((secret: IoK8sApiCoreV1Secret) => getName(secret)?.includes(userInput))
      ?.map((secret: IoK8sApiCoreV1Secret) => {
        const name = getName(secret);
        return <SelectOption key={name} value={name} />;
      });

  return (
    <Select
      hasInlineFilter
      id={id || 'select-secret'}
      isOpen={isOpen}
      maxHeight={400}
      menuAppendTo="parent"
      onFilter={filterSecrets}
      onSelect={onSelect}
      onToggle={() => setIsOpen(!isOpen)}
      placeholderText={t('--- Select secret ---')}
      selections={secretName}
      variant={SelectVariant.single}
    >
      {secretsResourceData?.map((secret: IoK8sApiCoreV1Secret) => {
        const name = getName(secret);
        return <SelectOption key={name} value={name} />;
      })}
    </Select>
  );
};

export default SecretDropdown;
