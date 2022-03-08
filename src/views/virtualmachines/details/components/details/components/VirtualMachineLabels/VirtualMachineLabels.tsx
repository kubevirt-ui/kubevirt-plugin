import * as React from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';

type VirtualMachineLabelsProps = {
  labels?: { [key: string]: string };
};

const VirtualMachineLabels: React.FC<VirtualMachineLabelsProps> = ({ labels }) => {
  return (
    <LabelGroup>
      {Object.keys(labels || {})?.map((key) => {
        return <Label color="blue" variant="outline" key={key}>{`${key}=${labels[key]}`}</Label>;
      })}
    </LabelGroup>
  );
};

export default VirtualMachineLabels;
