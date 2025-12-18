import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Label, LabelGroup } from '@patternfly/react-core';

import { getSearchLabelHREF } from '../Labels/utils';

type MetadataLabelsProps = {
  cluster?: string;
  labels?: { [key: string]: string };
  model: K8sModel;
};

const MetadataLabels: FC<MetadataLabelsProps> = ({ cluster, labels, model }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const labelsKeys = Object.keys(labels || {});

  if (isEmpty(labelsKeys)) {
    return <div className="pf-v6-u-text-color-subtle">{t('No labels')}</div>;
  }

  return (
    <LabelGroup numLabels={10}>
      {labelsKeys.map((key) => {
        const labelText = labels[key] ? `${key}=${labels[key]}` : key;

        return (
          <Label
            className="co-label"
            isClickable
            key={key}
            onClick={() => navigate(getSearchLabelHREF(model.kind, key, labels[key], cluster))}
          >
            {labelText}
          </Label>
        );
      })}
    </LabelGroup>
  );
};

export default MetadataLabels;
