import { type FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import {
  getMCOCheckErrorTooltip,
  getMCONotInstalledTooltip,
} from '@kubevirt-utils/hooks/useAlerts/utils/useMCOInstalled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { usePrometheusAvailability } from '@kubevirt-utils/hooks/usePrometheusAvailability';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, ExpandableSection, Title } from '@patternfly/react-core';
import { type NavPageComponentProps } from '@virtualmachines/details/utils/types';

import MigrationCharts from './MigrationCharts/MigrationCharts';
import NetworkCharts from './NetworkCharts/NetworkCharts';
import StorageCharts from './StorageCharts/StorageCharts';
import TimeRange from './TimeRange/TimeRange';
import UtilizationCharts from './UtilizationCharts/UtilizationCharts';
import { MetricsTabExpendedSections } from './utils/utils';

import './virtual-machine-metrics-tab.scss';

const VirtualMachineMetricsTab: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const { vmi, vmiLoaded } = useVMI(getName(vm), getNamespace(vm), getCluster(vm));
  const { mcoError, prometheusUnavailable } = usePrometheusAvailability(vm);

  const [expended, setExpended] = useState<{ [key in MetricsTabExpendedSections]: boolean }>({
    [MetricsTabExpendedSections.Migration]: true,
    [MetricsTabExpendedSections.Network]: true,
    [MetricsTabExpendedSections.Storage]: true,
    [MetricsTabExpendedSections.Utilization]: true,
  });

  const onToggle =
    (value: MetricsTabExpendedSections): (() => void) =>
    () =>
      setExpended((currentOpen) => ({ ...currentOpen, [value]: !currentOpen?.[value] }));

  useEffect(() => {
    if (!isEmpty(location?.search) && vmiLoaded) {
      const focusedSectionId = Object.values(MetricsTabExpendedSections).find((focusedSection) =>
        location?.search?.includes(focusedSection),
      );
      const element = focusedSectionId ? document.getElementById(focusedSectionId) : null;
      const scrollContainer = document.getElementById('horizontal-navbar-routes');

      if (element && scrollContainer) {
        scrollContainer.scrollTo({
          behavior: 'smooth',
          top: element.offsetTop - scrollContainer.offsetTop,
        });
      }
    }
  }, [location?.search, vmiLoaded]);

  return (
    <div className="virtual-machine-metrics-tab__main">
      <Title className="title" headingLevel="h2">
        {t('Metrics')}
      </Title>
      {prometheusUnavailable && (
        <Alert
          className="pf-v6-u-mb-md pf-v6-u-mx-md"
          isInline
          title={mcoError ? getMCOCheckErrorTooltip(t) : getMCONotInstalledTooltip(t)}
          variant={AlertVariant.warning}
        />
      )}
      {!prometheusUnavailable && <TimeRange />}
      <Overview className="virtual-machine-metrics-tab__charts">
        <ExpandableSection
          id={MetricsTabExpendedSections.Utilization}
          isExpanded={expended?.[MetricsTabExpendedSections.Utilization]}
          onToggle={onToggle(MetricsTabExpendedSections.Utilization)}
          toggleText={t('Utilization')}
        >
          <UtilizationCharts prometheusUnavailable={prometheusUnavailable} vmi={vmi} />
        </ExpandableSection>

        <ExpandableSection
          id={MetricsTabExpendedSections.Storage}
          isExpanded={expended?.[MetricsTabExpendedSections.Storage]}
          onToggle={onToggle(MetricsTabExpendedSections.Storage)}
          toggleText={t('Storage')}
        >
          <StorageCharts prometheusUnavailable={prometheusUnavailable} vmi={vmi} />
        </ExpandableSection>
        <ExpandableSection
          id={MetricsTabExpendedSections.Network}
          isExpanded={expended?.[MetricsTabExpendedSections.Network]}
          onToggle={onToggle(MetricsTabExpendedSections.Network)}
          toggleText={t('Network')}
        >
          <NetworkCharts prometheusUnavailable={prometheusUnavailable} vmi={vmi} />
        </ExpandableSection>
        <ExpandableSection
          id={MetricsTabExpendedSections.Migration}
          isExpanded={expended?.[MetricsTabExpendedSections.Migration]}
          onToggle={onToggle(MetricsTabExpendedSections.Migration)}
          toggleText={t('Migration')}
        >
          <MigrationCharts prometheusUnavailable={prometheusUnavailable} vmi={vmi} />
        </ExpandableSection>
      </Overview>
    </div>
  );
};

export default VirtualMachineMetricsTab;
