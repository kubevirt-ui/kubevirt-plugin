import React, { FC } from 'react';

import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import Limits from './Limits/Limits';
import Network from './Network/Network';

import './live-migration-section.scss';

const LiveMigrationSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge, , hyperConvergeDataError] = useHyperConvergeConfiguration();

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
