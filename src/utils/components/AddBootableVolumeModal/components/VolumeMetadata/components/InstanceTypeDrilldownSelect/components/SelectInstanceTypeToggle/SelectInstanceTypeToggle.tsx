import React, { FC } from 'react';

import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type SelectInstanceTypeToggleProps = {
  selected: string;
};
const SelectInstanceTypeToggle: FC<SelectInstanceTypeToggleProps> = ({ selected }) => {
  const { t } = useKubevirtTranslation();

  if (isEmpty(selected)) return t('Select InstanceType');

  return (
    <ResourceLink
      groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
      linkTo={false}
      name={selected}
    />
  );
};

export default SelectInstanceTypeToggle;
