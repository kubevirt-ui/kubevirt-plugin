import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';

import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import SecretSelectionRadioGroup from '@kubevirt-utils/components/SSHSecretSection/components/SecretSelectionRadioGroup';
import SSHKeyUpload from '@kubevirt-utils/components/SSHSecretSection/components/SSHKeyUpload/SSHKeyUpload';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Bullseye, Checkbox, Grid, GridItem } from '@patternfly/react-core';

import Loading from '../Loading/Loading';

import SSHOptionUseExisting from './components/SSHOptionUseExisting/SSHOptionUseExisting';
import { getMappedProjectsWithKeys } from './utils/utils';

import './SSHSecretSection.scss';

type SSHSecretSectionProps = {
  isTemplate: boolean;
  isUserTab: boolean;
  localNSProject: string;
  namespace?: string;
  secretsData: WatchK8sResult<IoK8sApiCoreV1Secret[]>;
  setLocalNSProject: Dispatch<SetStateAction<string>>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SSHSecretSection: FC<SSHSecretSectionProps> = ({
  isTemplate,
  isUserTab,
  localNSProject,
  namespace,
  secretsData: [secrets, loadedSecrets, errorLoadingSecrets],
  setLocalNSProject,
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const [secretSelectionOption, setSecretSelectionOption] = useState<SecretSelectionOption>(
    sshDetails.secretOption,
  );
  const projectsWithSecrets = useMemo(() => getMappedProjectsWithKeys(secrets), [secrets]);

  const showDefaultCheckbox =
    (secretSelectionOption === SecretSelectionOption.addNew && !isTemplate) ||
    (!isEmpty(projectsWithSecrets) && secretSelectionOption === SecretSelectionOption.useExisting);

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
          <SSHOptionUseExisting
            localNSProject={localNSProject}
            namespace={namespace}
            projectsWithSecrets={projectsWithSecrets}
            setLocalNSProject={setLocalNSProject}
            setSSHDetails={setSSHDetails}
            sshDetails={sshDetails}
          />
        )}
        {secretSelectionOption === SecretSelectionOption.addNew && (
          <SSHKeyUpload secrets={secrets} setSSHDetails={setSSHDetails} sshDetails={sshDetails} />
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
