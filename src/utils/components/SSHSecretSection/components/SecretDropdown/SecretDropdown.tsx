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
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { SSHSecretDetails } from '../../utils/types';

type SecretDropdownProps = {
  id?: string;
  secretsResourceData: IoK8sApiCoreV1Secret[];
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
};

const SecretDropdown: FC<SecretDropdownProps> = ({ id, secretsResourceData, setSSHDetails }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [secretName, setSecretName] = useState<string>('');

  useEffect(() => setSecretName(''), [secretsResourceData]);

  const onSelect = (_: MouseEvent, newSecretName: string) => {
    const sshPubKey = decodeSecret(
      secretsResourceData.find((secret: IoK8sApiCoreV1Secret) => getName(secret) === newSecretName),
    );
    setSecretName(newSecretName);
    setSSHDetails((prev) => ({
      ...prev,
      sshPubKey,
      sshSecretName: generatePrettyName(newSecretName),
    }));
    setIsOpen(false);
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
