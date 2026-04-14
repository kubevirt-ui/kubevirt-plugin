import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import InstanceTypeConfigurationDescriptionData from './InstanceTypeConfigurationDescriptionData';

type InstanceTypeConfigurationProps = {
  vm: V1VirtualMachine;
};

const InstanceTypeConfiguration: FC<InstanceTypeConfigurationProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionItem
      descriptionData={<InstanceTypeConfigurationDescriptionData vm={vm} />}
      descriptionHeader={t('InstanceType')}
    />
  );
};

export default InstanceTypeConfiguration;
