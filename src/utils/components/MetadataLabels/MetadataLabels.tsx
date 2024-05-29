import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { modelToRef } from '@kubevirt-ui/kubevirt-api/console';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Label, LabelGroup } from '@patternfly/react-core';

import './MetadataLabels.scss';

type MetadataLabelsProps = {
  labels?: { [key: string]: string };
  model: K8sModel;
};

const MetadataLabels: FC<MetadataLabelsProps> = ({ labels, model }) => {
  const modelRef = modelToRef(model);

  return (
    <LabelGroup className="metadata-labels-group" numLabels={10}>
      {Object.keys(labels || {})?.map((key) => {
        const labelText = labels[key] ? `${key}=${labels[key]}` : key;

        return (
          <Label className="co-label" key={key}>
            <Link
              className="pf-v5-c-label__content"
              to={`/search?kind=${modelRef}&q=${encodeURIComponent(labelText)}`}
            >
              {labelText}
            </Link>
          </Label>
        );
      })}
    </LabelGroup>
  );
};

export default MetadataLabels;
