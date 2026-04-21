import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import NetworkIcon from '@kubevirt-utils/components/NetworkIcons/NetworkIcon';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getConfigInterfaceStateFromVM } from '@kubevirt-utils/resources/vm/utils/network/selectors';

type TemplateStateCellProps = {
  row: NetworkPresentation;
  template: V1Template;
};

const TemplateStateCell: FC<TemplateStateCellProps> = ({ row, template }) => {
  const templateVM = getTemplateVirtualMachineObject(template);
  return (
    <NetworkIcon configuredState={getConfigInterfaceStateFromVM(templateVM, row.network?.name)} />
  );
};

export default TemplateStateCell;
