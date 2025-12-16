import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { modelToRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Label, LabelGroup } from '@patternfly/react-core';

type MetadataLabelsProps = {
  labels?: { [key: string]: string };
  model: K8sModel;
};

const MetadataLabels: FC<MetadataLabelsProps> = ({ labels, model }) => {
  const { t } = useKubevirtTranslation();
  const modelRef = modelToRef(model);
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
            onClick={() => navigate(`/search?kind=${modelRef}&q=${encodeURIComponent(labelText)}`)}
          >
            {labelText}
          </Label>
        );
      })}
    </LabelGroup>
  );
};

export default MetadataLabels;
