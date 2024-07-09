import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { Skeleton, StackItem } from '@patternfly/react-core';

import ConditionIcon from './ConditionIcon';
import { HCO_HEALTH_METRIC, VALUE_TO_LABLE } from './constants';

const Conditions: FC = () => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge, hyperLoaded] = useHyperConvergeConfiguration();

  const [queryData, loaded] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: HCO_HEALTH_METRIC,
  });

  const condition = queryData?.data?.result?.[0]?.value?.[1];

  const label = VALUE_TO_LABLE[condition];

  if (!loaded || !hyperLoaded)
    return (
      <StackItem>
        <Skeleton screenreaderText="Loading contents" />
      </StackItem>
    );

  if (!condition) return null;

  return (
    <>
      <StackItem>
        <div className="kv-health-popup__title">{t('Conditions')}</div>
      </StackItem>
      <StackItem className="kv-health-popup__alerts-count">
        <ConditionIcon conditionValue={condition} />
        <Link to={getResourceUrl({ model: HyperConvergedModel, resource: hyperConverge })}>
          {label}
        </Link>
      </StackItem>
    </>
  );
};

export default Conditions;
