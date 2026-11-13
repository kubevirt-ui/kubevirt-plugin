import { type FC, useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { generateValidSecretName } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { decodeSecret } from '@kubevirt-utils/resources/secret/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { shouldCopySshSecretFromProject } from '../../utils/sshSecretHelpers';
import { type SSHSecretDetails } from '../../utils/types';

type SecretDropdownProps = {
  namespace?: string;
  selectedProject: string;
  selectedProjectSecrets: IoK8sApiCoreV1Secret[];
};

const SecretDropdown: FC<SecretDropdownProps> = ({
  namespace,
  selectedProject,
  selectedProjectSecrets,
}) => {
  const { t } = useKubevirtTranslation();
  const activeNamespace = useNamespaceParam();
  const { control, setValue } = useFormContext<SSHSecretDetails>();

  const formSshSecretName = useWatch({ control, name: 'sshSecretName' });
  const formSshPubKey = useWatch({ control, name: 'sshPubKey' });

  const isCopyToTarget = shouldCopySshSecretFromProject(
    namespace ?? '',
    selectedProject,
    activeNamespace,
  );

  const [secretName, setSecretName] = useState<string>('');

  useEffect(() => {
    if (isCopyToTarget) {
      return;
    }

    const shouldClearDropdown = isEmpty(formSshSecretName) && isEmpty(formSshPubKey);

    if (shouldClearDropdown) {
      setSecretName('');
      return;
    }

    if (isEmpty(formSshSecretName)) {
      return;
    }

    const secretExists = selectedProjectSecrets?.some(
      (secret) => getName(secret) === formSshSecretName,
    );

    if (!secretExists) {
      return;
    }

    setSecretName(formSshSecretName);
  }, [formSshPubKey, formSshSecretName, isCopyToTarget, selectedProjectSecrets]);

  const secretOptions = useMemo(
    () =>
      selectedProjectSecrets?.map((secret: IoK8sApiCoreV1Secret) => {
        const name = getName(secret);
        return { children: name, value: name };
      }) ?? [],
    [selectedProjectSecrets],
  );

  const onSelect = (newSecretName: string): void => {
    const selectedSecret = selectedProjectSecrets.find(
      (secret: IoK8sApiCoreV1Secret) => getName(secret) === newSecretName,
    );

    if (!selectedSecret) {
      return;
    }

    const sshPubKey = decodeSecret(selectedSecret);
    const generatedSecretName = generateValidSecretName(newSecretName);

    setValue('sshPubKey', sshPubKey, { shouldDirty: true, shouldValidate: true });
    setValue('sshSecretName', isCopyToTarget ? generatedSecretName : newSecretName, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue('sshSecretNamespace', getNamespace(selectedSecret) ?? '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSecretName(newSecretName);
  };

  return (
    <InlineFilterSelect
      options={secretOptions}
      placeholder={t('Select secret')}
      selected={secretName}
      setSelected={onSelect}
      toggleProps={{ 'data-test': 'select-secret', isFullWidth: true }}
    />
  );
};

export default SecretDropdown;
