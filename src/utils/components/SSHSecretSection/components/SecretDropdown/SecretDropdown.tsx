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
  id?: string;
  secretsResourceData: WatchK8sResult<IoK8sApiCoreV1Secret[]>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SecretDropdown: FC<SecretDropdownProps> = ({
  id,
  secretsResourceData,
  setSSHDetails,
  sshDetails: { applyKeyToProject, sshSecretName },
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
      applyKeyToProject,
      secretOption: SecretSelectionOption.useExisting,
      sshPubKey,
      sshSecretName: newSecretName,
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
      <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
        {secretsError?.message}
      </Alert>
    );

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
      selections={sshSecretName}
      variant={SelectVariant.single}
    >
      {sshKeySecrets?.map((secret) => {
        const name = getName(secret);
        return <SelectOption key={name} value={name} />;
      })}
    </Select>
  );
};

export default SecretDropdown;
