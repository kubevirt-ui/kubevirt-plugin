import React, { FC } from 'react';
import { Link } from 'react-router';

import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { AlertType } from '@kubevirt-utils/components/AlertsCard/utils/types';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import useInfrastructureAlerts from '@kubevirt-utils/hooks/useInfrastructureAlerts/useInfrastructureAlerts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { Skeleton, StackItem } from '@patternfly/react-core';

import ConditionIcon from './ConditionIcon';
import { SEVERITY_TO_CONDITION_VALUE, VALUE_TO_LABEL } from './constants';

const Conditions: FC = () => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge, hyperLoaded] = useHyperConvergeConfiguration();
  const { alerts, loaded } = useInfrastructureAlerts();

  if (!loaded || !hyperLoaded)
    return (
      <StackItem>
        <Skeleton screenreaderText={t('Loading contents')} />
      </StackItem>
    );

  const getConditionValue = (): number => {
    if (alerts?.[AlertType.critical]?.length)
      return SEVERITY_TO_CONDITION_VALUE[AlertType.critical];
    if (alerts?.[AlertType.warning]?.length) return SEVERITY_TO_CONDITION_VALUE[AlertType.warning];
    return SEVERITY_TO_CONDITION_VALUE.none;
  };

  const condition = getConditionValue();

  const label = t(VALUE_TO_LABEL[condition]);

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
