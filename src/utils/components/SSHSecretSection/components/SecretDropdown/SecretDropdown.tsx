import React, { Dispatch, FC, ReactElement, SetStateAction, useState } from 'react';

import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import Loading from '../../../Loading/Loading';
import { SecretSelectionOption, SSHSecretDetails } from '../../utils/types';

type SecretDropdownProps = {
  secretsResourceData: WatchK8sResult<IoK8sApiCoreV1Secret[]>;
  sshSecretName: string;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  id?: string;
};

const SecretDropdown: FC<SecretDropdownProps> = ({
  secretsResourceData,
  sshSecretName,
  setSSHDetails,
  id,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const [allSecrets = [], secretsLoaded, secretsError] = secretsResourceData;
  const sshKeySecrets = allSecrets
    ?.filter((secret) => secret?.data && validateSSHPublicKey(decodeSecret(secret)))
    ?.sort((a, b) => a?.metadata?.name.localeCompare(b?.metadata?.name));

  const onSelect = (_, newSecretName: string) => {
    const sshPubKey = decodeSecret(
      sshKeySecrets.find((secret) => getName(secret) === newSecretName),
    );
    setSSHDetails({
      sshSecretName: newSecretName,
      sshPubKey,
      secretOption: SecretSelectionOption.useExisting,
    });
    setIsOpen(false);
  };

  const filterSecrets = (_, userInput: string): ReactElement[] =>
    sshKeySecrets
      ?.filter((secret) => getName(secret)?.includes(userInput))
      ?.map((secret) => {
        const name = getName(secret);
        return <SelectOption key={name} value={name} />;
      });

  if (!secretsLoaded) return <Loading />;

  if (secretsError)
    return (
      <Alert title={t('Error')} isInline variant={AlertVariant.danger}>
        {secretsError?.message}
      </Alert>
    );

  return (
    <Select
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      onSelect={onSelect}
      variant={SelectVariant.single}
      onFilter={filterSecrets}
      hasInlineFilter
      selections={sshSecretName}
      placeholderText={t('--- Select secret ---')}
      maxHeight={400}
      id={id || 'select-secret'}
      menuAppendTo="parent"
    >
      {sshKeySecrets?.map((secret) => {
        const name = getName(secret);
        return <SelectOption key={name} value={name} />;
      })}
    </Select>
  );
};

export default SecretDropdown;
