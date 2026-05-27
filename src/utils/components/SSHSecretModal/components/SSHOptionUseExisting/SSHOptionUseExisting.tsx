import React, { Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import {
  addNewSecret,
  getSecretNameErrorMessage,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertVariant,
  Bullseye,
  FormGroup,
  Grid,
  GridItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';

import { SecretSelectionOption, SSHSecretDetails } from '../../utils/types';
import SecretDropdown from '../SecretDropdown/SecretDropdown';

import './SSHOptionUseExisting.scss';

type SSHOptionUseExistingProps = {
  cluster?: string;
  localNamespace: string;
  namespace?: string;
  namespacesWithSecrets: { [namespace: string]: IoK8sApiCoreV1Secret[] };
  secrets: IoK8sApiCoreV1Secret[];
  secretsLoaded: boolean;
  setLocalNamespace: Dispatch<SetStateAction<string>>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SSHOptionUseExisting: FC<SSHOptionUseExistingProps> = ({
  cluster,
  localNamespace,
  namespace,
  namespacesWithSecrets,
  secrets,
  secretsLoaded,
  setLocalNamespace,
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const activeNamespace = useNamespaceParam();
  const [nameErrorMessage, setNameErrorMessage] = useState<string>(null);
  const [selectedNamespace, setSelectedNamespace] = useState<string>(
    localNamespace || namespace || sshDetails?.sshSecretNamespace,
  );
  const [userNamespaces] = useNamespaces(cluster, true);

  useEffect(() => {
    if (!selectedNamespace) {
      setSelectedNamespace(
        localNamespace || namespace || sshDetails?.sshSecretNamespace || userNamespaces?.[0],
      );
    }
  }, [namespace, localNamespace, userNamespaces, selectedNamespace, sshDetails?.sshSecretNamespace]);

  const onSelectNamespace = useCallback(
    (newNamespace: string) => {
      setSelectedNamespace(newNamespace);
      setLocalNamespace(newNamespace);
      const addNew = addNewSecret(namespace, newNamespace, activeNamespace);
      setSSHDetails((prev) => ({
        ...prev,
        secretOption: addNew ? SecretSelectionOption.addNew : SecretSelectionOption.useExisting,
        sshPubKey: '',
        sshSecretName: '',
        sshSecretNamespace: namespace,
      }));
    },
    [setLocalNamespace, namespace, activeNamespace, setSSHDetails],
  );

  const onSelectSecret = (generatedSecretName: string) => {
    setNameErrorMessage(getSecretNameErrorMessage(generatedSecretName, namespace, secrets));
  };

  const onChangeSecretName = (newSecretName: string) => {
    setNameErrorMessage(getSecretNameErrorMessage(newSecretName, namespace, secrets));
    setSSHDetails((prev) => ({
      ...prev,
      sshSecretName: newSecretName,
    }));
  };

  const showNewSecretNameField = namespace
    ? selectedNamespace !== namespace
    : selectedNamespace !== sshDetails?.sshSecretNamespace;

  if (isEmpty(userNamespaces)) return <Bullseye>{t('No SSH keys found')}</Bullseye>;

  return (
    <>
      <Alert
        title={t(
          'Select a secret from a different namespace to copy the secret to your current namespace.',
        )}
        isInline
        variant={AlertVariant.info}
      />
      <Grid className="ssh-use-existing__body">
        <GridItem span={6}>
          <FormGroup fieldId="namespace" label={t('Namespace')}>
            <InlineFilterSelect
              options={userNamespaces.map((namespace) => ({
                children: namespace,
                groupVersionKind: modelToGroupVersionKind(NamespaceModel),
                value: namespace,
              }))}
              className="ssh-use-existing__form-group--namespace"
              data-test="ssh-use-existing-namespace"
              placeholder={t('Select namespace')}
              selected={selectedNamespace}
              setSelected={onSelectNamespace}
              toggleProps={{ isFullWidth: true }}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            className="ssh-use-existing__form-group--secret"
            data-test="ssh-use-existing-secret"
            fieldId="secret"
            label={t('Public SSH key')}
          >
            {secretsLoaded ? (
              <SecretDropdown
                namespace={namespace}
                onSelectSecret={onSelectSecret}
                selectedNamespace={selectedNamespace}
                selectedNamespaceSecrets={namespacesWithSecrets?.[selectedNamespace]}
                setSSHDetails={setSSHDetails}
                sshDetails={sshDetails}
              />
            ) : (
              <Loading />
            )}
          </FormGroup>
        </GridItem>
      </Grid>
      {showNewSecretNameField && (
        <FormGroup label={t('New secret name')}>
          <TextInput
            id="new-secret-name"
            onChange={(_event, newSecretName: string) => onChangeSecretName(newSecretName)}
            type="text"
            value={sshDetails.sshSecretName}
          />
          <FormGroupHelperText
            validated={!nameErrorMessage ? ValidatedOptions.default : ValidatedOptions.error}
          >
            {nameErrorMessage && nameErrorMessage}
          </FormGroupHelperText>
        </FormGroup>
      )}
    </>
  );
};

export default SSHOptionUseExisting;
