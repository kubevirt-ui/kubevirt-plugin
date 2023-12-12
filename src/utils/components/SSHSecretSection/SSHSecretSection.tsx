import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import SecretDropdown from '@kubevirt-utils/components/SSHSecretSection/components/SecretDropdown/SecretDropdown';
import SecretSelectionRadioGroup from '@kubevirt-utils/components/SSHSecretSection/components/SecretSelectionRadioGroup';
import SSHKeyUpload from '@kubevirt-utils/components/SSHSecretSection/components/SSHKeyUpload/SSHKeyUpload';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ResourceLink,
  useActiveNamespace,
  WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Bullseye,
  Checkbox,
  FormGroup,
  Grid,
  GridItem,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
} from '@patternfly/react-core';

import Loading from '../Loading/Loading';

import { getSSHDropdownData } from './utils/utils';

import './SSHSecretSection.scss';

type SSHSecretSectionProps = {
  isTemplate: boolean;
  isUserTab: boolean;
  secretsData: WatchK8sResult<IoK8sApiCoreV1Secret[]>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SSHSecretSection: FC<SSHSecretSectionProps> = ({
  isTemplate,
  isUserTab,
  secretsData: [secrets, loadedSecrets, errorLoadingSecrets],
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const [selectedProject, setSelectedProject] = useState<string>();
  const [secretSelectionOption, setSecretSelectionOption] = useState<SecretSelectionOption>(
    sshDetails.secretOption,
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { allProjectsWithValidSSHKeys, projects } = useMemo(() => {
    const data = getSSHDropdownData(secrets);
    return { allProjectsWithValidSSHKeys: data, projects: Object.keys(data) };
  }, [secrets]);

  useEffect(
    () => !selectedProject && setSelectedProject(projects?.[0]),
    [projects, selectedProject],
  );

  const onFilterProject = (_: any, value: string) => {
    const filteredProjects = projects?.filter((project) => project.includes(value));

    return filteredProjects?.map((project) => (
      <SelectOption key={project} value={project}>
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(ProjectModel)}
          linkTo={false}
          name={project}
        />
      </SelectOption>
    ));
  };

  const onSelectProject = useCallback(
    (_: any, newValue: string) => {
      setSelectedProject(newValue);
      setSSHDetails((prev) => ({
        ...prev,
        secretOption:
          newValue !== activeNamespace
            ? SecretSelectionOption.addNew
            : SecretSelectionOption.useExisting,
        sshSecretName: '',
      }));

      setIsOpen(false);
    },
    [setSSHDetails, activeNamespace],
  );

  const onChangeSecretName = useCallback(
    (newSecretName: string) => {
      setSSHDetails((prev) => ({
        ...prev,
        sshSecretName: newSecretName,
      }));
      setIsOpen(false);
    },
    [setSSHDetails, setIsOpen],
  );

  if (!loadedSecrets) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  return (
    <Grid span={12}>
      <GridItem>
        <SecretSelectionRadioGroup
          selectedOption={secretSelectionOption}
          setSelectedOption={setSecretSelectionOption}
          setSSHDetails={setSSHDetails}
        />
      </GridItem>
      <GridItem className="ssh-secret-section__body">
        {secretSelectionOption === SecretSelectionOption.useExisting && (
          <>
            <Alert
              title={t(
                'Select a secret from a different project to copy the secret to your current project.',
              )}
              isInline
              variant={AlertVariant.info}
            />
            <Grid className="ssh-secret-section__body">
              <GridItem span={6}>
                <FormGroup fieldId="project" label={t('Project')}>
                  <Select
                    className="ssh-secret-section__form-group-project"
                    hasInlineFilter
                    inlineFilterPlaceholderText={t('Search project')}
                    isOpen={isOpen}
                    maxHeight={400}
                    onFilter={onFilterProject}
                    onSelect={onSelectProject}
                    onToggle={setIsOpen}
                    selections={selectedProject}
                    variant={SelectVariant.single}
                  >
                    {projects?.map((project) => (
                      <SelectOption key={project} value={project}>
                        <ResourceLink
                          groupVersionKind={modelToGroupVersionKind(ProjectModel)}
                          linkTo={false}
                          name={project}
                        />
                      </SelectOption>
                    ))}
                  </Select>
                </FormGroup>
              </GridItem>
              <GridItem span={6}>
                <FormGroup
                  className="ssh-secret-section__form-group-secret"
                  fieldId="secret"
                  label={t('Authorized SSH key')}
                >
                  <SecretDropdown
                    secretsResourceData={allProjectsWithValidSSHKeys?.[selectedProject]}
                    setSSHDetails={setSSHDetails}
                  />
                </FormGroup>
              </GridItem>
            </Grid>
            {selectedProject !== activeNamespace && (
              <FormGroup label={t('New secret name')}>
                <TextInput
                  id="new-secret-name"
                  onChange={onChangeSecretName}
                  type="text"
                  value={sshDetails.sshSecretName}
                />
              </FormGroup>
            )}
          </>
        )}
        {secretSelectionOption === SecretSelectionOption.addNew && (
          <SSHKeyUpload secrets={secrets} setSSHDetails={setSSHDetails} sshDetails={sshDetails} />
        )}
      </GridItem>
      {secretSelectionOption !== SecretSelectionOption.none && !isTemplate && (
        <Checkbox
          label={t(
            'Automatically apply this key to any new VirtualMachine you create in this project.',
          )}
          onClick={() =>
            setSSHDetails((prev) => ({ ...prev, applyKeyToProject: !prev.applyKeyToProject }))
          }
          className="pf-u-mt-md"
          id="apply-key-to-project-per-user"
          isChecked={sshDetails.applyKeyToProject || isUserTab}
          isDisabled={isUserTab}
        />
      )}
      {errorLoadingSecrets && (
        <Alert title={t('Error')} variant={AlertVariant.danger}>
          {errorLoadingSecrets}
        </Alert>
      )}
    </Grid>
  );
};

export default SSHSecretSection;
