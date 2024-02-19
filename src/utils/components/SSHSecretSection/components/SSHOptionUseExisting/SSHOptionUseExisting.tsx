import React, { Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import FilterSelect from '@kubevirt-utils/components/FilterSelect/FilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getSecretNameErrorMessage } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceCommon,
  useActiveNamespace,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
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
  loadedSecrets: boolean;
  localNSProject: string;
  namespace?: string;
  projectsWithSecrets: { [namespace: string]: IoK8sApiCoreV1Secret[] };
  secrets: IoK8sApiCoreV1Secret[];
  setLocalNSProject: Dispatch<SetStateAction<string>>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SSHOptionUseExisting: FC<SSHOptionUseExistingProps> = ({
  loadedSecrets,
  localNSProject,
  namespace,
  projectsWithSecrets,
  secrets,
  setLocalNSProject,
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const [selectedProject, setSelectedProject] = useState<string>();
  const [projectsData] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });
  const [nameErrorMessage, setNameErrorMessage] = useState<string>(null);
  const projects = projectsData?.map(({ metadata }) => metadata?.name);
  const showNewSecretNameField = namespace
    ? selectedProject !== namespace
    : selectedProject !== sshDetails?.sshSecretNamespace;

  useEffect(
    () =>
      !selectedProject &&
      setSelectedProject(
        localNSProject || namespace || sshDetails?.sshSecretNamespace || projects?.[0],
      ),
    [namespace, localNSProject, projects, selectedProject, sshDetails?.sshSecretNamespace],
  );

  const onSelectProject = useCallback(
    (newValue: string) => {
      setSelectedProject(newValue);
      setLocalNSProject(newValue);
      const addNew = namespace ? newValue !== namespace : newValue !== activeNamespace;
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

  return !isEmpty(projects) ? (
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
            <FilterSelect
              options={projects.map((proj) => ({
                children: proj,
                groupVersionKind: modelToGroupVersionKind(ProjectModel),
                value: proj,
              }))}
              className="ssh-use-existing__form-group--project"
              selected={selectedProject}
              setSelected={onSelectProject}
              toggleProps={{ placeholder: t('Search project') }}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            className="ssh-use-existing__form-group--secret"
            fieldId="secret"
            label={t('Public SSH key')}
          >
            {loadedSecrets ? (
              <SecretDropdown
                namespace={namespace}
                onSelectSecret={onSelectSecret}
                secretsResourceData={projectsWithSecrets?.[selectedProject]}
                selectedProject={selectedProject}
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
  ) : (
    <Bullseye>{t('No SSH keys found')}</Bullseye>
  );
};

export default SSHOptionUseExisting;
