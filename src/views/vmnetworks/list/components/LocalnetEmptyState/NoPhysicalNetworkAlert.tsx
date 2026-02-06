import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { CREATE_PHYSICAL_NETWORK_FORM_PATH } from 'src/views/vmnetworks/constants';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertActionLink } from '@patternfly/react-core';

import './NoPhysicalNetworkAlert.scss';

const NoPhysicalNetworkAlert: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  return (
    <Alert
      actionLinks={
        <AlertActionLink onClick={() => navigate(CREATE_PHYSICAL_NETWORK_FORM_PATH)}>
          {t('Create physical network')}
        </AlertActionLink>
      }
      className="no-physical-network-alert"
      isInline
      title={t('To create an OVN localnet network, you must first define a physical network.')}
      variant="warning"
    />
  );
};

export default NoPhysicalNetworkAlert;
