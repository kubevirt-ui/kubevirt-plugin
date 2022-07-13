import React, { useMemo } from 'react';

import { HyperConvergedModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant } from '@patternfly/react-core';

import Limits from './Limits/Limits';
import Network from './Network/Network';
import { getHyperConvergedObject, HyperConverged } from './utils/utils';

import './live-migration-tab.scss';

const LiveMigrationTab = () => {
  const { t } = useKubevirtTranslation();
  const [hyperConvergeData, , hyperConvergeDataError] = useK8sWatchResource<HyperConverged[]>({
    groupVersionKind: HyperConvergedModelGroupVersionKind,
    isList: true,
  });

  const hyperConverge = useMemo(
    () => getHyperConvergedObject(hyperConvergeData),
    [hyperConvergeData],
  );

  return (
    <div className="live-migration-tab">
      <Limits hyperConverge={hyperConverge} />
      <Network hyperConverge={hyperConverge} />
      {hyperConvergeDataError && (
        <Alert
          variant={AlertVariant.danger}
          isInline
          title={t('Error')}
          className="live-migration-tab--error"
        >
          {hyperConvergeDataError}
        </Alert>
      )}
    </div>
  );
};

export default LiveMigrationTab;
