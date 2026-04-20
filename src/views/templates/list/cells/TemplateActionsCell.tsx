import React, { FCC } from 'react';

import {
  isVirtualMachineTemplate,
  isVirtualMachineTemplateRequest,
  TemplateOrRequest,
} from '@kubevirt-utils/resources/template';

import VirtualMachineTemplatesActions from '../../actions/VirtualMachineTemplatesActions';
import VirtualMachineTemplateActions from '../../components/VirtualMachineTemplate/VirtualMachineTemplateActions';
import VirtualMachineTemplateRequestActions from '../../components/VirtualMachineTemplateRequest/VirtualMachineTemplateRequestActions';

type TemplateActionsCellProps = {
  row: TemplateOrRequest;
};

const TemplateActionsCell: FCC<TemplateActionsCellProps> = ({ row }) => {
  if (isVirtualMachineTemplateRequest(row)) {
    return <VirtualMachineTemplateRequestActions isKebabToggle request={row} />;
  }

  if (isVirtualMachineTemplate(row)) {
    return <VirtualMachineTemplateActions isKebabToggle vmTemplate={row} />;
  }

  return (
    <VirtualMachineTemplatesActions data-test="template-row-actions" isKebabToggle template={row} />
  );
};

export default TemplateActionsCell;
