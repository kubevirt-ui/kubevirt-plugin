import React, { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableSection } from '@patternfly/react-core';

import MigrationCharts from './MigrationCharts/MigrationCharts';
import StorageCharts from './StorageCharts/StorageCharts';
import TimeRange from './TimeRange/TimeRange';
import UtilizationCharts from './UtilizationCharts/UtilizationCharts';
import { MetricsTabExpendedSections } from './utils/utils';

import './virtual-machine-metrics-tab.scss';

const VirtualMachineMetricsTab = () => {
  const { t } = useKubevirtTranslation();
  const [duration, setDuration] = useState<string>();
  const [expended, setExpended] = useState<{ [key in MetricsTabExpendedSections]: boolean }>({
    [MetricsTabExpendedSections.utilization]: true,
    [MetricsTabExpendedSections.storage]: true,
    [MetricsTabExpendedSections.migration]: true,
  });

  console.log('duration: ', duration);

  const onToggle = (value) => () =>
    setExpended((currentOpen) => ({ ...currentOpen, [value]: !currentOpen?.[value] }));

  return (
    <div className="virtual-machine-metrics-tab__main">
      <TimeRange duration={duration} setDuration={setDuration} />
      <Overview className="virtual-machine-metrics-tab__charts">
        <ExpandableSection
          toggleText={t('Utilization')}
          onToggle={onToggle(MetricsTabExpendedSections.utilization)}
          isExpanded={expended?.[MetricsTabExpendedSections.utilization]}
        >
          <UtilizationCharts duration={duration} />
        </ExpandableSection>

        <ExpandableSection
          toggleText={t('Storage')}
          onToggle={onToggle(MetricsTabExpendedSections.storage)}
          isExpanded={expended?.[MetricsTabExpendedSections.storage]}
        >
          <StorageCharts duration={duration} />
        </ExpandableSection>
        <ExpandableSection
          toggleText={t('Migration')}
          onToggle={onToggle(MetricsTabExpendedSections.migration)}
          isExpanded={expended?.[MetricsTabExpendedSections.migration]}
        >
          <MigrationCharts duration={duration} />
        </ExpandableSection>
      </Overview>
    </div>
  );
};

export default VirtualMachineMetricsTab;
