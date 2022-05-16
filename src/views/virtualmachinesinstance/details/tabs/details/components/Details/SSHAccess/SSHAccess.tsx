import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import SSHAccessModal from '@kubevirt-utils/components/SSHAccess/SSHAccessModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type SSHAccessProps = {
  vmi: V1VirtualMachineInstance;
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded: boolean;
};

const SSHDetails: React.FC<SSHAccessProps> = ({ vmi, sshService, sshServiceLoaded }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  return (
    <>
      <DescriptionListTerm>{t('SSH Access')}</DescriptionListTerm>

      <DescriptionListDescription className="SSHAccess--container">
        {sshServiceLoaded ? <SSHAccess sshService={sshService} /> : <Loading />}

        <Button
          variant="link"
          isInline
          icon={
            <PencilAltIcon className="co-icon-space-l co-icon-space-r pf-c-button-icon--plain" />
          }
          iconPosition={'right'}
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <SSHAccessModal vmi={vmi} isOpen={isOpen} onClose={onClose} sshService={sshService} />
            ))
          }
        ></Button>
      </DescriptionListDescription>
    </>
  );
};

export default SSHDetails;
