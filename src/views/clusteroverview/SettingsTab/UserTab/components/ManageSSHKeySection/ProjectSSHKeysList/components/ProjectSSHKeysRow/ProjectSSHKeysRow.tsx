import React, { FC, useCallback, useMemo, useState } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import FilterSelect from '@kubevirt-utils/components/AddBootableVolumeModal/components/FilterSelect/FilterSelect';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { initialSSHCredentials } from '@kubevirt-utils/components/SSHSecretSection/utils/constants';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { createSSHSecret } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, Grid, GridItem, Truncate } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { ProjectSSHSecretMap } from '../../utils/types';
import AddProjectAuthKeyButton from '../AddProjectAuthKeyButton/AddProjectAuthKeyButton';

import '../SSHKeysRow.scss';

type ProjectSSHKeysRowProps = {
  authorizedSSHKeys: ProjectSSHSecretMap;
  handleChangeKeys: (val: any) => void;
  handleRemoveKey: () => void;
  projectsWithoutSSHKey: string[];
  secretProject?: string;
};

const ProjectSSHKeysRow: FC<ProjectSSHKeysRowProps> = ({
  authorizedSSHKeys,
  handleChangeKeys,
  handleRemoveKey,
  projectsWithoutSSHKey,
  secretProject,
}) => {
  const { t } = useKubevirtTranslation();

  const [selectedProject, setSelectedProject] = useState(secretProject);

  const secretName = useMemo(
    () =>
      !isEmpty(authorizedSSHKeys)
        ? (authorizedSSHKeys?.[selectedProject] as string)
        : initialSSHCredentials?.sshSecretName,
    [authorizedSSHKeys, selectedProject],
  );

  const onSubmit = useCallback(
    (sshDetails: SSHSecretDetails) => {
      const { secretOption, sshPubKey, sshSecretName } = sshDetails;

      if (isEqualObject(sshDetails?.sshSecretName, secretName)) {
        return Promise.resolve();
      }

      const updatedKeys = { ...authorizedSSHKeys };
      if (secretOption === SecretSelectionOption.none && !isEmpty(secretName)) {
        delete updatedKeys?.[selectedProject];
        handleChangeKeys(updatedKeys);
        return Promise.resolve();
      }

      if (
        secretOption === SecretSelectionOption.useExisting &&
        secretName !== sshSecretName &&
        !isEmpty(sshSecretName)
      ) {
        handleChangeKeys({ ...updatedKeys, [selectedProject]: sshDetails?.sshSecretName });
        return Promise.resolve();
      }

      if (
        secretOption === SecretSelectionOption.addNew &&
        !isEmpty(sshPubKey) &&
        !isEmpty(sshSecretName)
      ) {
        handleChangeKeys({ ...updatedKeys, [selectedProject]: sshDetails?.sshSecretName });
        return createSSHSecret(sshPubKey, sshSecretName, selectedProject);
      }
    },
    [authorizedSSHKeys, secretName, selectedProject, handleChangeKeys],
  );

  const handleRowRemove = () => {
    handleRemoveKey();
    if (!isEmpty(authorizedSSHKeys?.[selectedProject])) {
      const updatedKeys = { ...authorizedSSHKeys };
      delete updatedKeys?.[selectedProject];
      handleChangeKeys(updatedKeys);
    }
  };

  return (
    <Grid className="pf-u-mb-sm">
      <GridItem className="project-ssh-row__project-name" span={5}>
        {isEmpty(secretName) ? (
          <FilterSelect
            groupVersionKind={modelToGroupVersionKind(ProjectModel)}
            optionLabelText={t('project...')}
            options={projectsWithoutSSHKey}
            selected={selectedProject}
            setSelected={setSelectedProject}
          />
        ) : (
          <Truncate content={selectedProject} />
        )}
      </GridItem>
      <GridItem span={1} />
      <GridItem className="project-ssh-row__edit-button" span={5}>
        <AddProjectAuthKeyButton
          onSubmit={onSubmit}
          secretName={secretName}
          selectedProject={selectedProject}
        />
      </GridItem>
      <GridItem span={1}>
        <Button isInline onClick={handleRowRemove} variant="plain">
          <MinusCircleIcon />
        </Button>
      </GridItem>
    </Grid>
  );
};

export default ProjectSSHKeysRow;
