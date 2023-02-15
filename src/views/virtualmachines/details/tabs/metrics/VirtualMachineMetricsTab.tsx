import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableSection } from '@patternfly/react-core';

import MigrationCharts from './MigrationCharts/MigrationCharts';
import NetworkCharts from './NetworkCharts/NetworkCharts';
import StorageCharts from './StorageCharts/StorageCharts';
import TimeRange from './TimeRange/TimeRange';
import UtilizationCharts from './UtilizationCharts/UtilizationCharts';
import { MetricsTabExpendedSections } from './utils/utils';

import './virtual-machine-metrics-tab.scss';

type VirtualMachineMetricsTabProps = RouteComponentProps & {
  obj: V1VirtualMachine;
};

const VirtualMachineMetricsTab: React.FC<VirtualMachineMetricsTabProps> = ({
  obj: vm,
  location,
}) => {
  const { t } = useKubevirtTranslation();
  const { vmi, pods, loaded } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);

  const [expended, setExpended] = useState<{ [key in MetricsTabExpendedSections]: boolean }>({
    [MetricsTabExpendedSections.utilization]: true,
    [MetricsTabExpendedSections.storage]: true,
    [MetricsTabExpendedSections.network]: true,
    [MetricsTabExpendedSections.migration]: true,
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
      <TimeRange />
      <Overview className="virtual-machine-metrics-tab__charts">
        <ExpandableSection
          toggleText={t('Utilization')}
          onToggle={onToggle(MetricsTabExpendedSections.utilization)}
          isExpanded={expended?.[MetricsTabExpendedSections.utilization]}
          id={MetricsTabExpendedSections.utilization}
        >
          <UtilizationCharts vmi={vmi} pods={pods} />
        </ExpandableSection>

        <ExpandableSection
          toggleText={t('Storage')}
          onToggle={onToggle(MetricsTabExpendedSections.storage)}
          isExpanded={expended?.[MetricsTabExpendedSections.storage]}
          id={MetricsTabExpendedSections.storage}
        >
          <StorageCharts vmi={vmi} />
        </ExpandableSection>
        <ExpandableSection
          toggleText={t('Network')}
          onToggle={onToggle(MetricsTabExpendedSections.network)}
          isExpanded={expended?.[MetricsTabExpendedSections.network]}
          id={MetricsTabExpendedSections.network}
        >
          <NetworkCharts vmi={vmi} />
        </ExpandableSection>
        <ExpandableSection
          toggleText={t('Migration')}
          onToggle={onToggle(MetricsTabExpendedSections.migration)}
          isExpanded={expended?.[MetricsTabExpendedSections.migration]}
          id={MetricsTabExpendedSections.migration}
        >
          <MigrationCharts vmi={vmi} />
        </ExpandableSection>
      </Overview>
    </div>
  );
};

export default VirtualMachineMetricsTab;
