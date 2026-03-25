import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';

import VirtualMachineTemplatesSource from '../components/VirtualMachineTemplatesSource/VirtualMachineTemplatesSource';
import { TemplateCallbacks } from '../virtualMachineTemplatesDefinition';

type TemplateBootSourceCellProps = {
  callbacks: TemplateCallbacks;
  row: V1Template;
};

const TemplateBootSourceCell: FC<TemplateBootSourceCellProps> = ({ callbacks, row }) => {
  const { availableDataSources, availableTemplatesUID, cloneInProgressDataSources } = callbacks;

  return (
    <VirtualMachineTemplatesSource
      availableDataSources={availableDataSources}
      availableTemplatesUID={availableTemplatesUID}
      cloneInProgressDataSources={cloneInProgressDataSources}
      template={row}
    />
  );
};

export default TemplateBootSourceCell;
