import * as React from 'react';

import { LabelGroup } from '@patternfly/react-core';

import IndicationLabel from './IndicationLabel';

const IndicationLabelList = ({ snapshot }) => {
  const indications = snapshot?.status?.indications || [];

  if (indications.length === 0) {
    return <>-</>;
  }
  return (
    <LabelGroup>
      {indications.map((indication) => (
        <IndicationLabel
          indication={indication}
          key={`${snapshot?.metadata?.name}-${indication}`}
        />
      ))}
    </LabelGroup>
  );
};

export default IndicationLabelList;
