import React, { useState } from 'react';

import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

const SSHTabSSHAccess = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [sshService, sshServiceLoaded] = useSSHService(vm);
  const [isExpanded, setIsExpanded] = useState<boolean>();

  return (
    <ExpandableSection
      toggleContent={
        <>
          {t('SSH access')} <LinuxLabel />
        </>
      }
      isExpanded={isExpanded}
      isIndented
      onToggle={setIsExpanded}
    >
      <SSHAccess sshService={sshService} sshServiceLoaded={sshServiceLoaded} vm={vm} vmi={vmi} />
    </ExpandableSection>
  );
};

export default SSHTabSSHAccess;
