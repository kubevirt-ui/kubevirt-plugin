import React, { FC } from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Label, LabelProps } from '@patternfly/react-core';

import { getArchitectureLabelColor } from './constants';

type ArchitectureLabelProps = {
  architecture?: string;
} & Omit<LabelProps, 'color' | 'isCompact'>;

const ArchitectureLabel: FC<ArchitectureLabelProps> = ({ architecture, ...rest }) => {
  if (isEmpty(architecture)) return <>{NO_DATA_DASH}</>;

  return (
    <Label color={getArchitectureLabelColor(architecture)} isCompact {...rest}>
      {architecture}
    </Label>
  );
};

export default ArchitectureLabel;
