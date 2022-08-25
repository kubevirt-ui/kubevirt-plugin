import * as React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';

type SSHDetailsProps = {
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded: boolean;
};

const SSHDetails: React.FC<SSHDetailsProps> = ({ vmi, vm, sshService, sshServiceLoaded }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <DescriptionListTerm> {t('SSH access')}</DescriptionListTerm>

      <DescriptionListDescription className="SSHAccess--container">
        <SSHAccess sshService={sshService} vmi={vmi} sshServiceLoaded={sshServiceLoaded} vm={vm} />
      </DescriptionListDescription>
    </>
  );
};

export default SSHDetails;
