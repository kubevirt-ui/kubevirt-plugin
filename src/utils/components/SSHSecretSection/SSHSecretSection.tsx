import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import SecretDropdown from '@kubevirt-utils/components/SSHSecretSection/components/SecretDropdown/SecretDropdown';
import SecretSelectionRadioGroup from '@kubevirt-utils/components/SSHSecretSection/components/SecretSelectionRadioGroup';
import SSHKeyUpload from '@kubevirt-utils/components/SSHSecretSection/components/SSHKeyUpload/SSHKeyUpload';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, Grid, GridItem } from '@patternfly/react-core';

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
  secretsData: [secrets, ...loadedAndErrorData],
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const [secretSelectionOption, setSecretSelectionOption] = useState<SecretSelectionOption>(
    sshDetails.secretOption,
  );

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
          <SecretDropdown
            secretsResourceData={[secrets, ...loadedAndErrorData]}
            setSSHDetails={setSSHDetails}
            sshSecretName={sshDetails?.sshSecretName}
          />
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
    </Grid>
  );
};

export default SSHSecretSection;
