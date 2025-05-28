import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, Skeleton, Title } from '@patternfly/react-core';

import CloudInitCredentialsContent from './CloudInitCredentialsContent';

import './cloud-init-credentials.scss';

type CloudInitCredentialsProps = {
  vmName: string;
  vmNamespace: string;
};

const CloudInitCredentials: FC<CloudInitCredentialsProps> = ({
  vmName: name,
  vmNamespace: namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const [vm, isLoaded] = useK8sWatchResource<V1VirtualMachine>({
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
        bodyContent={t(
          'The following credentials for this operating system were created via cloud-init. If unsuccessful, cloud-init could be improperly configured. Contact the image provider for more information.',
        )}
      />
      {!isLoaded && !vm && <Skeleton screenreaderText={t('Loading guest login credentials')} />}
      {!!vm && <CloudInitCredentialsContent vm={vm} />}
    </Flex>
  );
};

export default CloudInitCredentials;
