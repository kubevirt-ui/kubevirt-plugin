import React, { FC } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FlexItem } from '@patternfly/react-core';
import { CheckCircleIcon, WarningTriangleIcon } from '@patternfly/react-icons';

import { SERVICE_TYPES } from '../constants';
import { isLoadBalancerBonded } from '../useSSHCommand';

type SSHServiceStateIconProps = {
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded?: boolean;
};

const SSHServiceStateIcon: FC<SSHServiceStateIconProps> = ({ sshService, sshServiceLoaded }) => {
  const { t } = useKubevirtTranslation();

  if (sshService?.spec?.type !== SERVICE_TYPES.LOAD_BALANCER) return null;

  if (!sshServiceLoaded) return null;

  return (
    <FlexItem>
      {!isLoadBalancerBonded(sshService) ? (
        <div>
          <WarningTriangleIcon color="var(--pf-global--warning-color--100)" /> {t('Pending')}{' '}
        </div>
      ) : (
        <div>
          <CheckCircleIcon color="var(--pf-global--success-color--100)" /> {t('Ready')}{' '}
        </div>
      )}
    </FlexItem>
  );
};

export default SSHServiceStateIcon;
