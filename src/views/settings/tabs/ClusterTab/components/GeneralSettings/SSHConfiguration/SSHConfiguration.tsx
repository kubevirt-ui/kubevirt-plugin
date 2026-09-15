import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack } from '@patternfly/react-core';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { getGeneralSettingsLabels } from '../consts/consts';
import SSHOverLoadBalancerService from './components/SSHOverLoadBalancerService';
import SSHOverNodePortService from './components/SSHOverNodePortService/SSHOverNodePortService';

type SSHConfigurationProps = { newBadge: boolean };

const SSHConfiguration: FC<SSHConfigurationProps> = ({ newBadge }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection
      dataTestID="ssh-configurations"
      searchItemId={CLUSTER_TAB_IDS.sshConfiguration}
      toggleText={getGeneralSettingsLabels(t).sshConfigurations}
    >
      <Stack hasGutter>
        <SSHOverLoadBalancerService newBadge={newBadge} />

        <SSHOverNodePortService newBadge={newBadge} />
      </Stack>
    </ExpandSection>
  );
};

export default SSHConfiguration;
