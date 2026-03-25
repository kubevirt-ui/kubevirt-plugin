import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';

import VirtualMachineTemplatesActions from '../../actions/VirtualMachineTemplatesActions';

type TemplateActionsCellProps = {
  row: V1Template;
};

const TemplateActionsCell: FC<TemplateActionsCellProps> = ({ row }) => {
  return (
    <VirtualMachineTemplatesActions data-test="template-row-actions" isKebabToggle template={row} />
  );
};

export default TemplateActionsCell;
