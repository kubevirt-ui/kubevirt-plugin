import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Flex, Skeleton, Title } from '@patternfly/react-core';

import CloudInitCredentialsContent from './CloudInitCredentialsContent';

import './cloud-init-credentials.scss';

type CloudInitCredentialsProps = {
  vmCluster?: string;
  vmName: string;
  vmNamespace: string;
};

const CloudInitCredentials: FC<CloudInitCredentialsProps> = ({
  vmCluster,
  vmName: name,
  vmNamespace: namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const [vm, isLoaded] = useK8sWatchData<V1VirtualMachine>({
    cluster: vmCluster,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    name,
    namespace,
  });

  return (
    <Flex className="cloud-init-credentials">
      <Title className="cloud-init-credentials-title" headingLevel="h6">
        {t('Guest login credentials')}
      </Title>
      <HelpTextIcon
        bodyContent={(hide) => (
          <PopoverContentWithLightspeedButton
            content={t(
              'The following credentials for this operating system were created via cloud-init. If unsuccessful, cloud-init could be improperly configured. Contact the image provider for more information.',
            )}
            hide={hide}
            obj={vm}
            promptType={OLSPromptType.GUEST_LOGIN_CREDENTIALS}
          />
        )}
      />
      {!isLoaded && !vm && <Skeleton screenreaderText={t('Loading guest login credentials')} />}
      {!!vm && <CloudInitCredentialsContent vm={vm} />}
    </Flex>
  );
};

export default CloudInitCredentials;
