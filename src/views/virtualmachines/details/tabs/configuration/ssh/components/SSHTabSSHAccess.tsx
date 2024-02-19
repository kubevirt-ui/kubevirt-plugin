import React, { useState } from 'react';

import LinuxLabel from '@kubevirt-utils/components/Labels/LinuxLabel';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
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
