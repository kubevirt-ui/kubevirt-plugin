import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Panel, PanelMain, PanelMainBody, Title } from '@patternfly/react-core';

const CheckupsNotFound: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Panel>
      <PanelMain>
        <PanelMainBody>
          <Title className="pf-v6-u-text-align-center" headingLevel="h2">
            {t('Checkup not found')}
          </Title>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

export default CheckupsNotFound;
