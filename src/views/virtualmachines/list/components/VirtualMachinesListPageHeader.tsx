import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageHeader, OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { Divider } from '@patternfly/react-core';
import SearchBar from '@search/components/SearchBar';

import VirtualMachinesCreateButton from './VirtualMachinesCreateButton/VirtualMachinesCreateButton';

type VirtualMachinesListPageHeaderProps = {
  namespace: string;
  onFilterChange: OnFilterChange;
};

const VirtualMachinesListPageHeader: FC<VirtualMachinesListPageHeaderProps> = ({
  namespace,
  onFilterChange,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ListPageHeader title={t('VirtualMachines')}>
      <SearchBar onFilterChange={onFilterChange} />
      <Divider orientation={{ default: 'vertical' }} />
      <div>
        <VirtualMachinesCreateButton namespace={namespace} />
      </div>
    </ListPageHeader>
  );
};

export default VirtualMachinesListPageHeader;
