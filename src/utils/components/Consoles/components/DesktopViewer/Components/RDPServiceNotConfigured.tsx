import React from 'react';
import { Trans } from 'react-i18next';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';

import { RDPServiceNotConfiguredProps } from '../utils/types';

import RDPServiceModal from './RDPServiceModal';

import './rdp-service.scss';

const RDPServiceNotConfigured: React.FC<RDPServiceNotConfiguredProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  return (
    <Trans ns="plugin__kubevirt-plugin" t={t}>
      <span>
        This is a Windows VirtualMachine but no Service for the RDP (Remote Desktop Protocol) can be
        found.
      </span>
      <br />
      <span>
        For better experience accessing Windows console, it is recommended to use the RDP.
        <Button
          className="kv-create-rdp-service-button"
          onClick={() => createModal((props) => <RDPServiceModal vm={vm} vmi={vmi} {...props} />)}
          variant={ButtonVariant.secondary}
        >
          Create RDP Service
        </Button>
      </span>
    </Trans>
  );
};

export default RDPServiceNotConfigured;
