import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachinesCreateButton from './VirtualMachinesCreateButton/VirtualMachinesCreateButton';

type VirtualMachinesListPageHeaderProps = {
  namespace: string;
};

const VirtualMachinesListPageHeader: FC<VirtualMachinesListPageHeaderProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ListPageHeader title={t('VirtualMachines')}>
      <div>
        <VirtualMachinesCreateButton namespace={namespace} />
      </div>
    </ListPageHeader>
  );
};

export default VirtualMachinesListPageHeader;
