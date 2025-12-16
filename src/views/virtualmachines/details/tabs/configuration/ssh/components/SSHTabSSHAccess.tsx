import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type SSHTabSSHAccessProps = {
  isCustomizeInstanceType?: boolean;
  vm: V1VirtualMachine;
};

const SSHTabSSHAccess: FC<SSHTabSSHAccessProps> = ({ isCustomizeInstanceType, vm }) => {
  const { t } = useKubevirtTranslation();
  const [sshService, sshServiceLoaded] = useSSHService(vm);

  return (
    <DescriptionItem
      descriptionData={
        <SSHAccess
          isCustomizeInstanceType={isCustomizeInstanceType}
          sshService={sshService}
          sshServiceLoaded={sshServiceLoaded}
          vm={vm}
        />
      }
      data-test-id="ssh-access"
      descriptionHeader={<SearchItem id="ssh-access">{t('SSH access')}</SearchItem>}
    />
  );
};

export default SSHTabSSHAccess;
