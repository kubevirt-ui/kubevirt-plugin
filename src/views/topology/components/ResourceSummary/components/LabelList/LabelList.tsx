import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';
import { LabelGroup as PfLabelGroup } from '@patternfly/react-core';

import Label from './Label';

export type LabelListProps = {
  expand?: boolean;
  kind: K8sGroupVersionKind;
  labels: { [key: string]: string };
};

// TODO Check if this can be replaced with an existing component(s)
const LabelList: FC<LabelListProps> = ({ expand = true, kind, labels }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {isEmpty(labels) ? (
        <div className="text-muted" key="0">
          {t('No labels')}
        </div>
      ) : (
        <PfLabelGroup
          className="co-label-group"
          data-test="label-list"
          defaultIsOpen={true}
          numLabels={20}
        >
          {Object.entries(labels)?.map?.(([key, value]) => (
            <Label expand={expand} key={key} kind={kind} name={key} value={value} />
          ))}
        </PfLabelGroup>
      )}
    </>
  );
};

export default LabelList;
