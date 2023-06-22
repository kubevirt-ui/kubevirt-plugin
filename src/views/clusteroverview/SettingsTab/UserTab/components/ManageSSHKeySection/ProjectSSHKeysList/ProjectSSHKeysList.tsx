import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  Grid,
  GridItem,
  Panel,
  PanelMain,
  Skeleton,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import ProjectSSHKeysRow from './components/ProjectSSHKeysRow/ProjectSSHKeysRow';
import useAuthorizedSSHKeys from './hooks/useAuthorizedSSHKeys';
import useSSHProjects from './hooks/useSSHProjects';

const ProjectSSHKeysList: FC = () => {
  const { t } = useKubevirtTranslation();

  const {
    authorizedSSHKeys,
    isAddingKey,
    loaded: settingsLoaded,
    setIsAddingKey,
    setSSHSecretKeys,
    sshSecretKeys,
    updateAuthorizedSSHKeys,
  } = useAuthorizedSSHKeys();

  const {
    loaded: projectsLoaded,
    projectsWithoutSSHKey,
    projectsWithSSHKey,
  } = useSSHProjects(sshSecretKeys);

  const loaded = useMemo(() => settingsLoaded && projectsLoaded, [settingsLoaded, projectsLoaded]);

  if (!loaded) return <Skeleton />;

  const addSSHKey = () => {
    setSSHSecretKeys((prev) => ({ ...prev, '': '' }));
    setIsAddingKey(true);
  };

  return (
    <>
      <Button
        icon={<PlusCircleIcon />}
        isDisabled={isAddingKey || isEmpty(projectsWithoutSSHKey)}
        isInline
        onClick={addSSHKey}
        variant="link"
      >
        {t('Add authorized SSH key to project')}
      </Button>
      {!isEmpty(projectsWithSSHKey) && (
        <Panel isScrollable>
          <PanelMain maxHeight="12.25rem">
            <Grid>
              <GridItem span={5}>
                <Text component={TextVariants.h6}>{t('Project')}</Text>
              </GridItem>
              <GridItem span={1} />
              <GridItem span={5}>
                <Text component={TextVariants.h6}>{t('Authorized SSH key')}</Text>
              </GridItem>
            </Grid>
            {projectsWithSSHKey.map((projectName) => (
              <ProjectSSHKeysRow
                handleChangeKeys={(val: any) => {
                  updateAuthorizedSSHKeys(val);
                  setSSHSecretKeys(val);
                  setIsAddingKey(false);
                }}
                handleRemoveKey={() => {
                  if (isAddingKey) {
                    setIsAddingKey(false);
                    const updatedKeys = { ...sshSecretKeys };
                    delete updatedKeys?.[''];
                    setSSHSecretKeys(updatedKeys);
                  }
                }}
                authorizedSSHKeys={authorizedSSHKeys}
                key={projectName}
                projectsWithoutSSHKey={projectsWithoutSSHKey}
                secretProject={projectName}
              />
            ))}
          </PanelMain>
        </Panel>
      )}
    </>
  );
};

export default ProjectSSHKeysList;
