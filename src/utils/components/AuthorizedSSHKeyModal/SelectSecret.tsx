import * as React from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import Loading from '../Loading/Loading';

import { decodeSecret } from './utils';

type SelectSecretProps = {
  selectedSecretName: string;
  onSelectSecret: (secretName: string) => void;
  namespace: string;
  id?: string;
};

const SelectSecret: React.FC<SelectSecretProps> = ({
  selectedSecretName,
  onSelectSecret,
  namespace,
  id,
}) => {
  const { t } = useKubevirtTranslation();
  const [isSecretSelectOpen, setSecretSelectOpen] = React.useState(false);

  const [secrets, secretsLoaded, secretsError] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    namespaced: true,
    isList: true,
    namespace,
  });

  const sshKeySecrets = secrets?.filter((secret) => validateSSHPublicKey(decodeSecret(secret)));

  const filterSecrets = (_, value: string): React.ReactElement[] => {
    let filteredSecrets = sshKeySecrets;

    if (value) {
      const regex = new RegExp(value, 'i');
      filteredSecrets = sshKeySecrets.filter((secret) => regex.test(secret?.metadata?.name));
    }

    return filteredSecrets.map((secret) => (
      <SelectOption key={secret?.metadata?.name} value={secret?.metadata?.name}>
        <ResourceLink kind={SecretModel.kind} name={secret?.metadata?.name} linkTo={false} />
      </SelectOption>
    )) as React.ReactElement[];
  };

  const onSelect = (event, newValue) => {
    onSelectSecret(newValue);
    setSecretSelectOpen(false);
  };

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
      isOpen={isSecretSelectOpen}
      onToggle={() => setSecretSelectOpen(!isSecretSelectOpen)}
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
        <SelectOption key={secret?.metadata?.name} value={secret?.metadata?.name}>
          <ResourceLink kind={SecretModel.kind} name={secret?.metadata?.name} linkTo={false} />
        </SelectOption>
      ))}
    </Select>
  );
};

export default SelectSecret;
