import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { shouldCopySshSecretFromProject } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, Bullseye, FormGroup, Grid, GridItem } from '@patternfly/react-core';

import useSecretsData from '../../hooks/useSecretsData';
import { type SSHOptionUseExistingProps, type SSHSecretDetails } from '../../utils/types';
import SecretDropdown from '../SecretDropdown/SecretDropdown';
import SSHUseExistingCopySecretNameField from './SSHUseExistingCopySecretNameField';

import './SSHOptionUseExisting.scss';

const SSHOptionUseExisting = ({ cluster, namespace }: SSHOptionUseExistingProps): ReactNode => {
  const { t } = useKubevirtTranslation();
  const activeNamespace = useNamespaceParam();
  const { control, getValues, setValue } = useFormContext<SSHSecretDetails>();
  const sshSecretNamespace = useWatch({ control, name: 'sshSecretNamespace' });

  const [selectedProject, setSelectedProject] = useState<string>(namespace ?? '');
  const [userProjects] = useProjects(cluster, true);

  const { secretsLoaded, secretsLoadError, sshKeySecrets } = useSecretsData(
    selectedProject || null,
    cluster,
  );
  useEffect(() => {
    if (!selectedProject) {
      setSelectedProject(namespace ?? getValues('sshSecretNamespace') ?? userProjects?.[0] ?? '');
    }
  }, [getValues, namespace, selectedProject, userProjects]);

  const onSelectProject = useCallback(
    (newProject: string) => {
      setSelectedProject(newProject);
      const isCopyFromSelectedProject = shouldCopySshSecretFromProject(
        namespace ?? '',
        newProject,
        activeNamespace,
      );
      setValue('sshPubKey', '', { shouldDirty: true, shouldValidate: false });
      setValue('sshSecretName', '', { shouldDirty: true, shouldValidate: false });
      setValue(
        'sshSecretNamespace',
        isCopyFromSelectedProject ? newProject : (namespace ?? newProject),
        { shouldDirty: true, shouldValidate: false },
      );
    },
    [activeNamespace, namespace, setValue],
  );

  const showCopySecretNameField = namespace
    ? selectedProject !== namespace
    : selectedProject !== sshSecretNamespace;

  if (isEmpty(userProjects)) {
    return <Bullseye>{t('No SSH keys found')}</Bullseye>;
  }

  return (
    <>
      {secretsLoadError && <ErrorAlert error={secretsLoadError} />}
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
                selectedProject={selectedProject}
                selectedProjectSecrets={sshKeySecrets}
              />
            ) : (
              <Loading />
            )}
          </FormGroup>
        </GridItem>
      </Grid>
      {showCopySecretNameField && <SSHUseExistingCopySecretNameField />}
    </>
  );
};

export default SSHOptionUseExisting;
