import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import SecretDropdown from '@kubevirt-utils/components/SSHSecretSection/utils/components/SecretDropdown/SecretDropdown';
import SecretSelectionRadioGroup from '@kubevirt-utils/components/SSHSecretSection/utils/components/SecretSelectionRadioGroup';
import SSHKeyUpload from '@kubevirt-utils/components/SSHSecretSection/utils/components/SSHKeyUpload/SSHKeyUpload';
import {
  SecretSelectionOption,
  SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Grid, GridItem, PopoverPosition } from '@patternfly/react-core';

import HelpTextIcon from '../HelpTextIcon/HelpTextIcon';

import './SSHSecretSection.scss';

type SSHSecretSectionProps = {
  sshSecretDetails: SSHSecretDetails;
  setSSHSecretDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
};

const SSHSecretSection: FC<SSHSecretSectionProps> = ({ sshSecretDetails, setSSHSecretDetails }) => {
  const [activeNamespace] = useActiveNamespace();
  const [secretSelectionOption, setSecretSelectionOption] = useState<SecretSelectionOption>(
    SecretSelectionOption.none,
  );

  const secretsResourceData = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    isList: true,
    ...(activeNamespace !== ALL_NAMESPACES_SESSION_KEY && {
      namespace: activeNamespace,
    }),
  });

  const setSelectedSecretName = (secretName) => {
    setSSHSecretDetails({ sshSecretName: secretName, sshSecretKey: '' });
  };

  // Inputs should not persist between changes of secretSelectionOption
  useEffect(() => {
    setSSHSecretDetails({ sshSecretName: '', sshSecretKey: '' });
  }, [secretSelectionOption, setSSHSecretDetails]);

  return (
    <Grid className="ssh-secret-section">
      <GridItem className="ssh-secret-section__title">
        {t('Authorized SSH key')}{' '}
        <HelpTextIcon
          bodyContent={t('SSH key is saved in the namespace as a secret')}
          position={PopoverPosition.right}
        />
      </GridItem>
      <GridItem span={12}>
        <SecretSelectionRadioGroup
          selectedOption={secretSelectionOption}
          setSelectedOption={setSecretSelectionOption}
        />
      </GridItem>
      <GridItem span={12} className="ssh-secret-section__body">
        {secretSelectionOption === SecretSelectionOption.useExisting && (
          <SecretDropdown
            secretsResourceData={secretsResourceData}
            selectedSecretName={sshSecretDetails?.sshSecretName}
            onSelectSecret={setSelectedSecretName}
          />
        )}
        {secretSelectionOption === SecretSelectionOption.addNew && (
          <SSHKeyUpload
            sshSecretCredentials={sshSecretDetails}
            setSSHSecretCredentials={setSSHSecretDetails}
            secrets={secretsResourceData?.[0]}
          />
        )}
      </GridItem>
    </Grid>
  );
};

export default SSHSecretSection;
