import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, Text } from '@patternfly/react-core';

import CloudInitCredentialsContent from './CloudInitCredentialsContent';

import './cloud-init-credentials.scss';

type CloudInitCredentialsProps = {
  isStandAlone?: boolean;
  vm: V1VirtualMachine;
};

const CloudInitCredentials: FC<CloudInitCredentialsProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Flex className="cloud-init-credentials">
      <Text className="cloud-init-credentials-title" component="h6">
        {t('Guest login credentials')}
      </Text>
      <HelpTextIcon
        bodyContent={t(
          'The following credentials for this operating system were created via cloud-init. If unsuccessful, cloud-init could be improperly configured. Contact the image provider for more information.',
        )}
      />
      <CloudInitCredentialsContent vm={vm} />
    </Flex>
  );
};

export default CloudInitCredentials;
