import React, { FC, useMemo } from 'react';

import { HyperConvergedModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant } from '@patternfly/react-core';

import { getHyperConvergedObject } from '../../../../utils/utils';
import ExpandSection from '../../../ExpandSection/ExpandSection';

import Limits from './Limits/Limits';
import Network from './Network/Network';
import { HyperConverged } from './utils/utils';

import './live-migration-section.scss';

const LiveMigrationSection: FC = () => {
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
    <ExpandSection className="live-migration-tab" toggleText={t('Live migration')}>
      <Limits hyperConverge={hyperConverge} />
      <Network hyperConverge={hyperConverge} />
      {hyperConvergeDataError && (
        <Alert
          className="live-migration-tab--error"
          isInline
          title={t('Error')}
          variant={AlertVariant.danger}
        >
          {hyperConvergeDataError}
        </Alert>
      )}
    </ExpandSection>
  );
};

export default LiveMigrationSection;
