import { type FC, useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { createSSHSecret } from '@kubevirt-utils/resources/secret/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import ErrorAlert from '../ErrorAlert/ErrorAlert';
import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import TabModal from '../TabModal/TabModal';
import SSHSecretModalBody from './components/SSHSecretModalBody/SSHSecretModalBody';
import useSSHSecretFormResolver from './hooks/useSSHSecretFormResolver';
import { resolveSSHSecretDetailsForSubmit } from './utils/sshSecretHelpers';
import { SecretSelectionOption, type SSHSecretDetails } from './utils/types';

const SSH_SUBMIT_VALIDATION_ERROR = 'SSH_SECRET_MODAL_VALIDATION';

type SSHSecretModalProps = {
  cluster?: string;
  initialSSHSecretDetails: SSHSecretDetails;
  isOpen: boolean;
  isTemplate?: boolean;
  isUserTab?: boolean;
  namespace: string;
  onClose: () => void;
  onSubmit: (sshDetails: SSHSecretDetails) => Promise<unknown | void>;
};

const SSHSecretModal: FC<SSHSecretModalProps> = ({
  cluster: clusterOverride,
  initialSSHSecretDetails,
  isOpen,
  isTemplate = false,
  isUserTab = false,
  namespace,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;

  const { resolver, secretsLoaded, secretsLoadError } = useSSHSecretFormResolver(
    namespace,
    cluster,
  );

  const methods = useForm<SSHSecretDetails>({
    defaultValues: initialSSHSecretDetails,
    mode: 'all',
    resolver,
  });

  const {
    formState: { isValid },
    handleSubmit: submitForm,
    reset,
    trigger,
  } = methods;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset(initialSSHSecretDetails);
    void trigger();
  }, [initialSSHSecretDetails, isOpen, reset, trigger]);

  const handleSubmit = useCallback(
    () =>
      submitForm(
        async (formValues) => {
          const sshDetails = resolveSSHSecretDetailsForSubmit(formValues, namespace);

          if (sshDetails.secretOption === SecretSelectionOption.AddNew) {
            await createSSHSecret(
              sshDetails.sshPubKey,
              sshDetails.sshSecretName,
              namespace,
              cluster,
              true,
            );
          }

          return onSubmit(sshDetails);
        },
        () => Promise.reject(new Error(SSH_SUBMIT_VALIDATION_ERROR)),
      )(),
    [cluster, namespace, onSubmit, submitForm],
  );

  return (
    <FormProvider {...methods}>
      <TabModal
        headerText={t('Public SSH key')}
        isDisabled={!secretsLoaded || !isValid}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        shouldWrapInForm
      >
        <MutedTextSpan text={t('SSH key is saved in the project as a secret')} />
        <SSHSecretModalBody
          cluster={cluster}
          isTemplate={isTemplate}
          isUserTab={isUserTab}
          namespace={namespace}
        />
        {secretsLoadError && <ErrorAlert error={secretsLoadError} />}
      </TabModal>
    </FormProvider>
  );
};

export default SSHSecretModal;
