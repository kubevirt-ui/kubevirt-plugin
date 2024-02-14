import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableSection, Title } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import MigrationCharts from './MigrationCharts/MigrationCharts';
import NetworkCharts from './NetworkCharts/NetworkCharts';
import StorageCharts from './StorageCharts/StorageCharts';
import TimeRange from './TimeRange/TimeRange';
import UtilizationCharts from './UtilizationCharts/UtilizationCharts';
import { MetricsTabExpendedSections } from './utils/utils';

import './virtual-machine-metrics-tab.scss';

const VirtualMachineMetricsTab: FC<NavPageComponentProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const { loaded, pods, vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);

  const [expended, setExpended] = useState<{ [key in MetricsTabExpendedSections]: boolean }>({
    [MetricsTabExpendedSections.migration]: true,
    [MetricsTabExpendedSections.network]: true,
    [MetricsTabExpendedSections.storage]: true,
    [MetricsTabExpendedSections.utilization]: true,
  });

  const onToggle = (value) => () =>
    setExpended((currentOpen) => ({ ...currentOpen, [value]: !currentOpen?.[value] }));

  useEffect(() => {
    if (!isEmpty(location?.search) && loaded) {
      const focusedSectionId = Object.values(MetricsTabExpendedSections).find((focusedSection) =>
        location?.search?.includes(focusedSection),
      );
      const focusedExpandableSection = document.getElementById(focusedSectionId);
      focusedExpandableSection.scrollIntoView();
    }
  }, [location?.search, loaded]);

  return (
    <div className="virtual-machine-metrics-tab__main">
      <Title className="title" headingLevel="h2">
        {t('Metrics')}
      </Title>
      <TimeRange />
      <Overview className="virtual-machine-metrics-tab__charts">
        <ExpandableSection
          id={MetricsTabExpendedSections.utilization}
          isExpanded={expended?.[MetricsTabExpendedSections.utilization]}
          onToggle={onToggle(MetricsTabExpendedSections.utilization)}
          toggleText={t('Utilization')}
        >
          <UtilizationCharts pods={pods} vmi={vmi} />
        </ExpandableSection>

        <ExpandableSection
          id={MetricsTabExpendedSections.storage}
          isExpanded={expended?.[MetricsTabExpendedSections.storage]}
          onToggle={onToggle(MetricsTabExpendedSections.storage)}
          toggleText={t('Storage')}
        >
          <StorageCharts vmi={vmi} />
        </ExpandableSection>
        <ExpandableSection
          id={MetricsTabExpendedSections.network}
          isExpanded={expended?.[MetricsTabExpendedSections.network]}
          onToggle={onToggle(MetricsTabExpendedSections.network)}
          toggleText={t('Network')}
        >
          <NetworkCharts vmi={vmi} />
        </ExpandableSection>
        <ExpandableSection
          id={MetricsTabExpendedSections.migration}
          isExpanded={expended?.[MetricsTabExpendedSections.migration]}
          onToggle={onToggle(MetricsTabExpendedSections.migration)}
          toggleText={t('Migration')}
        >
          <MigrationCharts vmi={vmi} />
        </ExpandableSection>
      </Overview>
    </div>
  );
};

export default VirtualMachineMetricsTab;
