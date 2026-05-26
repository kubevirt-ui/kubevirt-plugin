import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants, Title } from '@patternfly/react-core';

import { DiagnosticSeverity, DiagnosticSeverityCounts } from '../../utils/types';
import DiagnosticsOverviewCards from '../DiagnosticsOverviewCards/DiagnosticsOverviewCards';

type DiagnosticsOverviewProps = {
  activeSeverity: DiagnosticSeverity | null;
  counts: DiagnosticSeverityCounts;
  onSeverityChange: (severity: DiagnosticSeverity | null) => void;
};

const DiagnosticsOverview: FC<DiagnosticsOverviewProps> = ({
  activeSeverity,
  counts,
  onSeverityChange,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="pf-v6-u-mb-lg">
      <Title className="pf-v6-u-mb-sm" headingLevel="h2">
        {t('Diagnostics overview')}
      </Title>
      <Content className="pf-v6-u-mb-md" component={ContentVariants.p}>
        {t(
          'Review virtual machine health from status conditions, volume snapshot eligibility, and DataVolume import state.',
        )}
      </Content>
      <DiagnosticsOverviewCards
        activeSeverity={activeSeverity}
        counts={counts}
        onSeverityChange={onSeverityChange}
      />
    </div>
  );
};

export default DiagnosticsOverview;
