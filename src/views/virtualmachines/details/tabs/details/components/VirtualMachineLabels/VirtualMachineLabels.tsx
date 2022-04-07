import * as React from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';

import './VirtualMachineLabels.scss';

type VirtualMachineLabelsProps = {
  labels?: { [key: string]: string };
};

const VirtualMachineLabels: React.FC<VirtualMachineLabelsProps> = ({ labels }) => {
  return (
    <LabelGroup numLabels={10} className="vm-labels-group">
      {Object.keys(labels || {})?.map((key) => {
        return <Label key={key}>{labels[key] ? `${key}=${labels[key]}` : key}</Label>;
      })}
    </LabelGroup>
  );
};

export default VirtualMachineLabels;
