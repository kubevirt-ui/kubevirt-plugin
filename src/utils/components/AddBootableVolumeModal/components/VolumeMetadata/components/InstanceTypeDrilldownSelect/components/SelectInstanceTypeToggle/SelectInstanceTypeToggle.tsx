import React, { FC } from 'react';

import {
  VirtualMachineClusterInstancetypeModelGroupVersionKind,
  VirtualMachineInstancetypeModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineClusterInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type SelectInstanceTypeToggleProps = {
  selected: string;
  selectedKind: string;
};
const SelectInstanceTypeToggle: FC<SelectInstanceTypeToggleProps> = ({
  selected,
  selectedKind,
}) => {
  const { t } = useKubevirtTranslation();

  if (isEmpty(selected)) return t('Select InstanceType');

  return (
    <ResourceLink
      groupVersionKind={
        selectedKind === VirtualMachineClusterInstancetypeModel.kind
          ? VirtualMachineClusterInstancetypeModelGroupVersionKind
          : VirtualMachineInstancetypeModelGroupVersionKind
      }
      linkTo={false}
      name={selected}
    />
  );
};

export default SelectInstanceTypeToggle;
