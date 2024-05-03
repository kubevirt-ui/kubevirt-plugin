import React, { FC, useState } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

type SSHTabSSHAccessProps = {
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const SSHTabSSHAccess: FC<SSHTabSSHAccessProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [sshService, sshServiceLoaded] = useSSHService(vm);
  const [isExpanded, setIsExpanded] = useState<boolean>();

  return (
    <ExpandableSection
      toggleContent={
        <>
          <SearchItem id="ssh-access">{t('SSH access')}</SearchItem>
          <LinuxLabel />
        </>
      }
      isExpanded={isExpanded}
      isIndented
      onToggle={(_event, val) => setIsExpanded(val)}
    >
      <SSHAccess sshService={sshService} sshServiceLoaded={sshServiceLoaded} vm={vm} vmi={vmi} />
    </ExpandableSection>
  );
};

export default SSHTabSSHAccess;
