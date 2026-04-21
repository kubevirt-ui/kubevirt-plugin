import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import SecretSelectionRadioGroup from '@kubevirt-utils/components/SSHSecretModal/components/SecretSelectionRadioGroup';
import SSHKeyUpload from '@kubevirt-utils/components/SSHSecretModal/components/SSHKeyUpload/SSHKeyUpload';
import {
  SecretsData,
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Checkbox, Grid, GridItem } from '@patternfly/react-core';

import SSHOptionUseExisting from '../SSHOptionUseExisting/SSHOptionUseExisting';

import './SSHSecretModalBody.scss';

type SSHSecretModalBodyProps = {
  cluster?: string;
  isTemplate: boolean;
  isUserTab: boolean;
  localNSProject: string;
  namespace?: string;
  secretsData: SecretsData;
  setLocalNSProject: Dispatch<SetStateAction<string>>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SSHSecretModalBody: FC<SSHSecretModalBodyProps> = ({
  cluster,
  isTemplate,
  isUserTab,
  localNSProject,
  namespace,
  secretsData,
  setLocalNSProject,
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const [secretSelectionOption, setSecretSelectionOption] = useState<SecretSelectionOption>(
    sshDetails.secretOption,
  );

  const { allSecrets, projectsWithSecrets, secretsLoaded, secretsLoadError } = secretsData;

  const showDefaultCheckbox =
    (secretSelectionOption === SecretSelectionOption.addNew && !isTemplate) ||
    (!isEmpty(projectsWithSecrets) && secretSelectionOption === SecretSelectionOption.useExisting);

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
          <SSHOptionUseExisting
            cluster={cluster}
            localNSProject={localNSProject}
            namespace={namespace}
            projectsWithSecrets={projectsWithSecrets}
            secrets={allSecrets}
            secretsLoaded={secretsLoaded}
            setLocalNSProject={setLocalNSProject}
            setSSHDetails={setSSHDetails}
            sshDetails={sshDetails}
          />
        )}
        {secretSelectionOption === SecretSelectionOption.addNew && (
          <SSHKeyUpload
            secrets={allSecrets}
            setSSHDetails={setSSHDetails}
            sshDetails={sshDetails}
          />
        )}
      </GridItem>
      {showDefaultCheckbox && (
        <Checkbox
          label={t(
            'Automatically apply this key to any new VirtualMachine you create in this project.',
          )}
          onClick={() =>
            setSSHDetails((prev) => ({ ...prev, applyKeyToProject: !prev.applyKeyToProject }))
          }
          className="pf-v6-u-mt-md"
          id="apply-key-to-project-per-user"
          isChecked={sshDetails.applyKeyToProject || isUserTab}
          isDisabled={isUserTab}
        />
      )}
      {secretsLoadError && <ErrorAlert error={secretsLoadError} />}
    </Grid>
  );
};

export default SSHSecretModalBody;
