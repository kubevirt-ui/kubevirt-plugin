import * as React from 'react';

import { LabelGroup } from '@patternfly/react-core';

import IndicationLabel from './IndicationLabel';

const IndicationLabelList = ({ snapshot }) => {
  const indications = snapshot?.status?.sourceIndications || [];

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
