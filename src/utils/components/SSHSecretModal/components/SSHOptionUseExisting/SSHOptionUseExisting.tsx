import React, { Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import {
  addNewSecret,
  getSecretNameErrorMessage,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
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
  localNSProject: string;
  namespace?: string;
  projectsWithSecrets: { [namespace: string]: IoK8sApiCoreV1Secret[] };
  secrets: IoK8sApiCoreV1Secret[];
  secretsLoaded: boolean;
  setLocalNSProject: Dispatch<SetStateAction<string>>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SSHOptionUseExisting: FC<SSHOptionUseExistingProps> = ({
  localNSProject,
  namespace,
  projectsWithSecrets,
  secrets,
  secretsLoaded,
  setLocalNSProject,
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const [nameErrorMessage, setNameErrorMessage] = useState<string>(null);
  const [selectedProject, setSelectedProject] = useState<string>(
    localNSProject || namespace || sshDetails?.sshSecretNamespace,
  );
  const [projects] = useProjects();

  useEffect(
    () =>
      !selectedProject &&
      setSelectedProject(
        localNSProject || namespace || sshDetails?.sshSecretNamespace || projects?.[0],
      ),
    [namespace, localNSProject, projects, selectedProject, sshDetails?.sshSecretNamespace],
  );

  const onSelectProject = useCallback(
    (newProject: string) => {
      setSelectedProject(newProject);
      setLocalNSProject(newProject);
      const addNew = addNewSecret(namespace, newProject, activeNamespace);
      setSSHDetails((prev) => ({
        ...prev,
        secretOption: addNew ? SecretSelectionOption.addNew : SecretSelectionOption.useExisting,
        sshPubKey: '',
        sshSecretName: '',
        sshSecretNamespace: namespace,
      }));
    },
    [setLocalNSProject, namespace, activeNamespace, setSSHDetails],
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
    ? selectedProject !== namespace
    : selectedProject !== sshDetails?.sshSecretNamespace;

  if (isEmpty(projects)) return <Bullseye>{t('No SSH keys found')}</Bullseye>;

  return (
    <>
      <Alert
        title={t(
          'Select a secret from a different project to copy the secret to your current project.',
        )}
        isInline
        variant={AlertVariant.info}
      />
      <Grid className="ssh-use-existing__body">
        <GridItem span={6}>
          <FormGroup fieldId="project" label={t('Project')}>
            <InlineFilterSelect
              options={projects.map((project) => ({
                children: project,
                groupVersionKind: modelToGroupVersionKind(ProjectModel),
                value: project,
              }))}
              className="ssh-use-existing__form-group--project"
              selected={selectedProject}
              setSelected={onSelectProject}
              toggleProps={{ isFullWidth: true, placeholder: t('Select project') }}
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
