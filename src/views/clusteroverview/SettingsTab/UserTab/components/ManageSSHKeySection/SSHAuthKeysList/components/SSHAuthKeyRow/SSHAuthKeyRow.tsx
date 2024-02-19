import React, { FC, useCallback } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import FilterSelect from '@kubevirt-utils/components/FilterSelect/FilterSelect';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { createSSHSecret } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, Grid, GridItem, Truncate } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { AuthKeyRow } from '../../utils/types';
import AddProjectAuthKeyButton from '../AddProjectAuthKeyButton/AddProjectAuthKeyButton';

import './SSHAuthKeyRow.scss';

type SSHAuthKeyRowProps = {
  isRemoveDisabled: boolean;
  onAuthKeyChange: (updatedKey: AuthKeyRow) => void;
  onAuthKeyDelete: (keyToRemove: AuthKeyRow) => void;
  row: AuthKeyRow;
  selectableProjects: string[];
};

const SSHAuthKeyRow: FC<SSHAuthKeyRowProps> = ({
  isRemoveDisabled,
  onAuthKeyChange,
  onAuthKeyDelete,
  row,
  selectableProjects,
}) => {
  const { t } = useKubevirtTranslation();
  const { projectName, secretName } = row;

  const onSubmit = useCallback(
    (sshDetails: SSHSecretDetails) => {
      const { secretOption, sshPubKey, sshSecretName } = sshDetails;

      if (isEqualObject(sshDetails?.sshSecretName, secretName)) {
        return Promise.resolve();
      }

      if (secretOption === SecretSelectionOption.none && !isEmpty(secretName)) {
        const updatedRow = { ...row, secretName: '' };
        onAuthKeyChange(updatedRow);
        return Promise.resolve();
      }

      if (
        secretOption === SecretSelectionOption.useExisting &&
        secretName !== sshSecretName &&
        !isEmpty(sshSecretName)
      ) {
        const updatedRow = { ...row, secretName: sshSecretName };
        onAuthKeyChange(updatedRow);
        return Promise.resolve();
      }

      if (
        secretOption === SecretSelectionOption.addNew &&
        !isEmpty(sshPubKey) &&
        !isEmpty(sshSecretName)
      ) {
        const updatedRow = { ...row, secretName: sshSecretName };
        onAuthKeyChange(updatedRow);
        return createSSHSecret(sshPubKey, sshSecretName, projectName);
      }
    },
    [secretName, row, onAuthKeyChange, projectName],
  );

  return (
    <Grid className="pf-u-mb-sm">
      <GridItem className="ssh-auth-row__project-name" span={5}>
        {isEmpty(secretName) ? (
          <FilterSelect
            options={selectableProjects?.map((opt) => ({
              children: opt,
              groupVersionKind: modelToGroupVersionKind(ProjectModel),
              value: opt,
            }))}
            selected={projectName}
            setSelected={(newProject) => onAuthKeyChange({ ...row, projectName: newProject })}
            toggleProps={{ placeholder: t('Select project') }}
          />
        ) : (
          <Truncate content={projectName} />
        )}
      </GridItem>
      <GridItem span={1} />
      <GridItem className="ssh-auth-row__edit-button" span={5}>
        <AddProjectAuthKeyButton
          onSubmit={onSubmit}
          secretName={secretName}
          selectedProject={projectName}
        />
      </GridItem>
      <GridItem span={1}>
        <Button
          isDisabled={isRemoveDisabled}
          isInline
          onClick={() => onAuthKeyDelete(row)}
          variant="plain"
        >
          <MinusCircleIcon />
        </Button>
      </GridItem>
    </Grid>
  );
};

export default SSHAuthKeyRow;
