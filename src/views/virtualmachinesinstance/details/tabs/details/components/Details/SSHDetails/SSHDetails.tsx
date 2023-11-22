import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';

type SSHDetailsProps = {
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const SSHDetails: React.FC<SSHDetailsProps> = ({ sshService, sshServiceLoaded, vm, vmi }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <DescriptionListTerm> {t('SSH access')}</DescriptionListTerm>

      <DescriptionListDescription className="SSHAccess--container">
        <SSHAccess sshService={sshService} sshServiceLoaded={sshServiceLoaded} vm={vm} vmi={vmi} />
      </DescriptionListDescription>
    </>
  );
};

export default SSHDetails;
