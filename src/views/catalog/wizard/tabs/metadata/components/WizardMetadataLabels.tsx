import * as React from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';

import './WizardMetadataLabels.scss';

type WizardMetadataLabelsProps = {
  labels?: { [key: string]: string };
};

const WizardMetadataLabels: React.FC<WizardMetadataLabelsProps> = ({ labels }) => {
  return (
    <LabelGroup numLabels={10} className="wizard-metadata-labels-group">
      {Object.keys(labels || {})?.map((key) => {
        return <Label key={key}>{labels[key] ? `${key}=${labels[key]}` : key}</Label>;
      })}
    </LabelGroup>
  );
};

export default WizardMetadataLabels;
