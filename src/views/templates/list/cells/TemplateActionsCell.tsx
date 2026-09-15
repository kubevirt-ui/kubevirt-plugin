import type { FC } from 'react';

import type { TemplateOrRequest } from '@kubevirt-utils/resources/template';
import {
  isVirtualMachineTemplate,
  isVirtualMachineTemplateRequest,
} from '@kubevirt-utils/resources/template';

import VirtualMachineTemplatesActions from '../../actions/VirtualMachineTemplatesActions';
import VirtualMachineTemplateActions from '../../components/VirtualMachineTemplate/VirtualMachineTemplateActions';
import VirtualMachineTemplateRequestActions from '../../components/VirtualMachineTemplateRequest/VirtualMachineTemplateRequestActions';

type TemplateActionsCellProps = {
  row: TemplateOrRequest;
};

const TemplateActionsCell: FC<TemplateActionsCellProps> = ({ row }) => {
  if (isVirtualMachineTemplateRequest(row)) {
    return <VirtualMachineTemplateRequestActions isKebabToggle request={row} />;
  }

  if (isVirtualMachineTemplate(row)) {
    return <VirtualMachineTemplateActions isKebabToggle vmTemplate={row} />;
  }

  return <VirtualMachineTemplatesActions isKebabToggle template={row} />;
};

export default TemplateActionsCell;
