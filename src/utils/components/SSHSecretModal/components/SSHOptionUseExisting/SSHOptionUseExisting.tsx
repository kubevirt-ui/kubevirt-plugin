import React, { type ReactNode, useCallback, useEffect, useState } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import {
  addNewSecret,
  getSecretNameErrorMessage,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  Bullseye,
  FormGroup,
  Grid,
  GridItem,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';

import { SecretSelectionOption, type SSHOptionUseExistingProps } from '../../utils/types';
import SecretDropdown from '../SecretDropdown/SecretDropdown';

import './SSHOptionUseExisting.scss';

const SSHOptionUseExisting = ({
  cluster,
  localNSProject,
  namespace,
  projectsWithSecrets,
  secrets,
  secretsLoaded,
  setLocalNSProject,
  setSSHDetails,
  sshDetails,
}: SSHOptionUseExistingProps): ReactNode => {
  const { t } = useKubevirtTranslation();
  const activeNamespace = useNamespaceParam();
  const [nameErrorMessage, setNameErrorMessage] = useState<string>(null);
  const [selectedProject, setSelectedProject] = useState<string>(
    localNSProject ?? namespace ?? sshDetails?.sshSecretNamespace,
  );
  const [userProjects] = useProjects(cluster, true);

  useEffect(() => {
    if (!selectedProject) {
      setSelectedProject(
        localNSProject ?? namespace ?? sshDetails?.sshSecretNamespace ?? userProjects?.[0],
      );
    }
  }, [namespace, localNSProject, userProjects, selectedProject, sshDetails?.sshSecretNamespace]);

  const onSelectProject = useCallback(
    (newProject: string) => {
      setSelectedProject(newProject);
      setLocalNSProject(newProject);
      const addNew = addNewSecret(namespace, newProject, activeNamespace);
      setSSHDetails((prev) => ({
        ...prev,
        secretOption: addNew ? SecretSelectionOption.AddNew : SecretSelectionOption.UseExisting,
        sshPubKey: '',
        sshSecretName: '',
        sshSecretNamespace: namespace,
      }));
    },
    [setLocalNSProject, namespace, activeNamespace, setSSHDetails],
  );

  const onSelectSecret = (generatedSecretName: string): void => {
    setNameErrorMessage(getSecretNameErrorMessage(generatedSecretName, namespace, secrets));
  };

  const onChangeSecretName = (newSecretName: string): void => {
    setNameErrorMessage(getSecretNameErrorMessage(newSecretName, namespace, secrets));
    setSSHDetails((prev) => ({
      ...prev,
      sshSecretName: newSecretName,
    }));
  };

  const showNewSecretNameField = namespace
    ? selectedProject !== namespace
    : selectedProject !== sshDetails?.sshSecretNamespace;

  if (isEmpty(userProjects)) {
    return <Bullseye>{t('No SSH keys found')}</Bullseye>;
  }

  return (
    <>
      <Alert
        isInline
        title={t(
          'Select a secret from a different project to copy the secret to your current project.',
        )}
        variant="info"
      />
      <Grid className="ssh-use-existing__body">
        <GridItem span={6}>
          <FormGroup fieldId="project" label={t('Project')}>
            <InlineFilterSelect
              className="ssh-use-existing__form-group--project"
              options={userProjects.map((project) => ({
                children: project,
                groupVersionKind: modelToGroupVersionKind(ProjectModel),
                value: project,
              }))}
              placeholder={t('Select project')}
              selected={selectedProject}
              setSelected={onSelectProject}
              toggleProps={{ isFullWidth: true }}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            className="ssh-use-existing__form-group--secret"
            fieldId="secret"
            label={t('Public SSH key')}
          >
            {secretsLoaded ? (
              <SecretDropdown
                namespace={namespace}
                onSelectSecret={onSelectSecret}
                selectedProject={selectedProject}
                selectedProjectSecrets={projectsWithSecrets?.[selectedProject]}
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
            validated={nameErrorMessage ? ValidatedOptions.error : ValidatedOptions.default}
          >
            {nameErrorMessage}
          </FormGroupHelperText>
        </FormGroup>
      )}
    </>
  );
};

export default SSHOptionUseExisting;
