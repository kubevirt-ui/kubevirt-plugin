import React, { type FC } from 'react';

import { type V1beta1VirtualMachineSnapshot } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { LabelGroup } from '@patternfly/react-core';

import IndicationLabel from './IndicationLabel';

type IndicationLabelListProps = {
  snapshot: V1beta1VirtualMachineSnapshot;
};

const IndicationLabelList: FC<IndicationLabelListProps> = ({ snapshot }) => {
  const indications = snapshot?.status?.sourceIndications ?? [];

  if (indications.length === 0) {
    return <>-</>;
  }
  return (
    <LabelGroup>
      {indications.map((indicationObject) => (
        <IndicationLabel
          indicationObject={indicationObject}
          key={`${snapshot?.metadata?.name}-${indicationObject.indication}`}
        />
      ))}
    </LabelGroup>
  );
};

export default IndicationLabelList;
