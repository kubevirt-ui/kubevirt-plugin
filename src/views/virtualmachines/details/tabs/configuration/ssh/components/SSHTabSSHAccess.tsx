import type { FC } from 'react';
import React from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import useIsVMEditable from '@kubevirt-utils/components/VMEditPermissionContext/useIsVMEditable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type SSHTabSSHAccessProps = {
  isCustomizeInstanceType?: boolean;
  vm: V1VirtualMachine;
};

const SSHTabSSHAccess: FC<SSHTabSSHAccessProps> = ({ isCustomizeInstanceType, vm }) => {
  const { t } = useKubevirtTranslation();
  const [sshService, sshServiceLoaded, sshServiceError] = useSSHService(vm);
  const isEditable = useIsVMEditable();

  return (
    <DescriptionItem
      data-test="ssh-access"
      descriptionData={
        <SSHAccess
          isCustomizeInstanceType={isCustomizeInstanceType}
          isDisabled={!isEditable}
          sshService={sshService}
          sshServiceError={sshServiceError}
          sshServiceLoaded={sshServiceLoaded}
          vm={vm}
        />
      }
      descriptionHeader={<SearchItem id="ssh-access">{t('SSH access')}</SearchItem>}
    />
  );
};

export default SSHTabSSHAccess;
