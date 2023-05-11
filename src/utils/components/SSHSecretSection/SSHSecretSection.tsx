import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import SecretDropdown from '@kubevirt-utils/components/SSHSecretSection/components/SecretDropdown/SecretDropdown';
import SecretSelectionRadioGroup from '@kubevirt-utils/components/SSHSecretSection/components/SecretSelectionRadioGroup';
import SSHKeyUpload from '@kubevirt-utils/components/SSHSecretSection/components/SSHKeyUpload/SSHKeyUpload';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem } from '@patternfly/react-core';

import './SSHSecretSection.scss';

type SSHSecretSectionProps = {
  namespace: string;
  sshSecretCredentials: SSHSecretDetails;
  setSSHSecretCredentials: Dispatch<SetStateAction<SSHSecretDetails>>;
};

const SSHSecretSection: FC<SSHSecretSectionProps> = ({
  namespace,
  sshSecretCredentials,
  setSSHSecretCredentials,
}) => {
  const [secretSelectionOption, setSecretSelectionOption] = useState<SecretSelectionOption>(
    SecretSelectionOption.none,
  );

  const [secrets, ...loadedAndErrorData] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    isList: true,
    ...(namespace !== ALL_NAMESPACES_SESSION_KEY && {
      namespace,
    }),
  });

  return (
    <Grid>
      <GridItem span={12}>
        <SecretSelectionRadioGroup
          selectedOption={secretSelectionOption}
          setSelectedOption={setSecretSelectionOption}
          setSSHCredentials={setSSHSecretCredentials}
        />
      </GridItem>
      <GridItem span={12} className="ssh-secret-section__body">
        {secretSelectionOption === SecretSelectionOption.useExisting && (
          <SecretDropdown
            secretsResourceData={[secrets, ...loadedAndErrorData]}
            setSSHCredentials={setSSHSecretCredentials}
            sshSecretName={sshSecretCredentials?.sshSecretName}
          />
        )}
        {secretSelectionOption === SecretSelectionOption.addNew && (
          <SSHKeyUpload
            secrets={secrets}
            sshCredentials={sshSecretCredentials}
            setSSHCredentials={setSSHSecretCredentials}
          />
        )}
      </GridItem>
    </Grid>
  );
};

export default SSHSecretSection;
