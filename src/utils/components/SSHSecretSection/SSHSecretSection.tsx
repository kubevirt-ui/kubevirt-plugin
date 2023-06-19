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
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, Grid, GridItem } from '@patternfly/react-core';

import './SSHSecretSection.scss';

type SSHSecretSectionProps = {
  applyKeyToProject: boolean;
  isTemplate: boolean;
  isUserTab: boolean;
  namespace: string;
  setApplyKeyToProject: Dispatch<SetStateAction<boolean>>;
  setSSHDetails: Dispatch<SetStateAction<SSHSecretDetails>>;
  sshDetails: SSHSecretDetails;
};

const SSHSecretSection: FC<SSHSecretSectionProps> = ({
  applyKeyToProject,
  isTemplate,
  isUserTab,
  namespace,
  setApplyKeyToProject,
  setSSHDetails,
  sshDetails,
}) => {
  const { t } = useKubevirtTranslation();
  const [secretSelectionOption, setSecretSelectionOption] = useState<SecretSelectionOption>(
    sshDetails.secretOption,
  );

  const [secrets, ...loadedAndErrorData] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    isList: true,
    ...(namespace !== ALL_NAMESPACES_SESSION_KEY && {
      namespace,
    }),
  });

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
            sshDetails={sshDetails}
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
          className="pf-u-mt-md"
          id="apply-key-to-project-per-user"
          isChecked={(applyKeyToProject && !isEmpty(sshDetails?.sshSecretName)) || isUserTab}
          isDisabled={isUserTab}
          onClick={() => setApplyKeyToProject((prev) => !prev)}
        />
      )}
    </Grid>
  );
};

export default SSHSecretSection;
