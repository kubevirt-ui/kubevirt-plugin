import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import SSHAccessModal from '@kubevirt-utils/components/SSHAccess/SSHAccessModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type SSHAccessProps = {
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded: boolean;
};

const SSHDetails: React.FC<SSHAccessProps> = ({ vmi, vm, sshService, sshServiceLoaded }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  return (
    <>
      <DescriptionListTerm>{t('SSH access')}</DescriptionListTerm>

      <DescriptionListDescription className="SSHAccess--container">
        {!sshServiceLoaded && <Loading />}

        <Button
          variant="link"
          isInline
          icon={
            <PencilAltIcon className="co-icon-space-l co-icon-space-r pf-c-button-icon--plain" />
          }
          iconPosition={'right'}
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <SSHAccessModal
                vmi={vmi}
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                sshService={sshService}
              />
            ))
          }
        >
          <SSHAccess sshService={sshService} />
        </Button>
      </DescriptionListDescription>
    </>
  );
};

export default SSHDetails;
