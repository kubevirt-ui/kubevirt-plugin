import React, { FC, ReactElement, useState } from 'react';

import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Select, SelectVariant } from '@patternfly/react-core';

import Loading from '../../../../Loading/Loading';
import { decodeSecret } from '../../utils';

import SecretSelectOption from './components/SecretSelectOption';

type SecretDropdownProps = {
  secretsResourceData: WatchK8sResult<IoK8sApiCoreV1Secret[]>;
  selectedSecretName: string;
  onSelectSecret: (secretName: string) => void;
  id?: string;
};

const SecretDropdown: FC<SecretDropdownProps> = ({
  secretsResourceData,
  selectedSecretName,
  onSelectSecret,
  id,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const [allSecrets, secretsLoaded, secretsError] = secretsResourceData;
  const sshKeySecrets = allSecrets
    ? allSecrets?.filter((secret) => validateSSHPublicKey(decodeSecret(secret)))
    : [];

  const onSelect = (event, newSecretName) => {
    onSelectSecret(newSecretName);
    setIsOpen(false);
  };

  const filterSecrets = (_, userInput: string): ReactElement[] =>
    sshKeySecrets
      ?.filter((secret) => getName(secret)?.includes(userInput))
      ?.map((secret) => (
        <SecretSelectOption key={getName(secret)} secret={secret} />
      )) as ReactElement[];

  if (!secretsLoaded) return <Loading />;

  if (secretsError)
    return (
      <Alert title={t('Error')} isInline variant={AlertVariant.danger}>
        {secretsError?.message}
      </Alert>
    );

  return (
    <Select
      menuAppendTo="parent"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      onSelect={onSelect}
      variant={SelectVariant.single}
      onFilter={filterSecrets}
      hasInlineFilter
      selections={selectedSecretName}
      placeholderText={t('--- Select secret ---')}
      maxHeight={400}
      id={id || 'select-secret'}
    >
      {sshKeySecrets?.map((secret) => (
        <SecretSelectOption key={getName(secret)} secret={secret} />
      ))}
    </Select>
  );
};

export default SecretDropdown;
