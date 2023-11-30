import React, { FC } from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';

import './metadata-tab-labels.scss';

type MetadataTabLabelsProps = {
  labels?: { [key: string]: string };
};

const MetadataTabLabels: FC<MetadataTabLabelsProps> = ({ labels }) => {
  return (
    <LabelGroup className="MetadataTabLabels-labels-group" numLabels={10}>
      {Object.keys(labels || {})?.map((key) => (
        <Label key={key}>{labels[key] ? `${key}=${labels[key]}` : key}</Label>
      ))}
    </LabelGroup>
  );
};

export default MetadataTabLabels;
