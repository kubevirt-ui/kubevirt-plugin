import React, { FC, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import SecretDropdown from '@kubevirt-utils/components/SSHSecretSection/components/SecretDropdown/SecretDropdown';
import SecretSelectionRadioGroup from '@kubevirt-utils/components/SSHSecretSection/components/SecretSelectionRadioGroup';
import SSHKeyUpload from '@kubevirt-utils/components/SSHSecretSection/components/SSHKeyUpload/SSHKeyUpload';
import { SecretSelectionOption } from '@kubevirt-utils/components/SSHSecretSection/utils/types';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem, PopoverPosition } from '@patternfly/react-core';

import HelpTextIcon from '../HelpTextIcon/HelpTextIcon';

import './SSHSecretSection.scss';

const SSHSecretSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { activeNamespace } = useInstanceTypeVMStore();
  const [secretSelectionOption, setSecretSelectionOption] = useState<SecretSelectionOption>(
    SecretSelectionOption.none,
  );

  const [secrets, ...loadedAndErrorData] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    isList: true,
    ...(activeNamespace !== ALL_NAMESPACES_SESSION_KEY && {
      namespace: activeNamespace,
    }),
  });

  return (
    <Grid className="ssh-secret-section">
      <GridItem className="ssh-secret-section__title">
        {t('Authorized SSH key')}{' '}
        <HelpTextIcon
          bodyContent={t('SSH key is saved in the project as a secret')}
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
          <SecretDropdown secretsResourceData={[secrets, ...loadedAndErrorData]} />
        )}
        {secretSelectionOption === SecretSelectionOption.addNew && (
          <SSHKeyUpload secrets={secrets} />
        )}
      </GridItem>
    </Grid>
  );
};

export default SSHSecretSection;
