import type { FC } from 'react';
import React from 'react';

import NetworkIcon from '@kubevirt-utils/components/NetworkIcons/NetworkIcon';
import type { Template } from '@kubevirt-utils/resources/template';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import type { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getConfigInterfaceStateFromVM } from '@kubevirt-utils/resources/vm/utils/network/selectors';

type TemplateStateCellProps = {
  row: NetworkPresentation;
  template: Template;
};

const TemplateStateCell: FC<TemplateStateCellProps> = ({ row, template }) => {
  const templateVM = getTemplateVirtualMachineObject(template);
  return (
    <NetworkIcon configuredState={getConfigInterfaceStateFromVM(templateVM, row.network?.name)} />
  );
};

export default TemplateStateCell;
