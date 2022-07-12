import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import SSHAccessModal from '@kubevirt-utils/components/SSHAccess/SSHAccessModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  DescriptionListDescription,
  DescriptionListTerm,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type SSHDetailsProps = {
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded: boolean;
};

const SSHDetails: React.FC<SSHDetailsProps> = ({ vmi, vm, sshService, sshServiceLoaded }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <>
      <DescriptionListTerm>
        <Flex>
          <FlexItem>{t('SSH access')}</FlexItem>
          <FlexItem>
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
              {t('Edit')}
            </Button>
          </FlexItem>
        </Flex>
      </DescriptionListTerm>

      <DescriptionListDescription className="SSHAccess--container">
        <SSHAccess sshService={sshService} vmi={vmi} sshServiceLoaded={sshServiceLoaded} />
      </DescriptionListDescription>
    </>
  );
};

export default SSHDetails;
