import React, { FC, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PageSection, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import DiagnosticsEmptyFilterState from './components/DiagnosticsEmptyFilterState/DiagnosticsEmptyFilterState';
import DiagnosticsIssuesToolbar from './components/DiagnosticsIssuesToolbar/DiagnosticsIssuesToolbar';
import DiagnosticsOverview from './components/DiagnosticsOverview/DiagnosticsOverview';
import useDiagnosticCounts from './hooks/useDiagnosticCounts';
import useDiagnosticData from './hooks/useDiagnosticData';
import useFilteredDiagnosticData from './hooks/useFilteredDiagnosticData';
import VirtualMachineDiagnosticTabConditions from './tables/VirtualMachineDiagnosticTabConditions';
import VirtualMachineDiagnosticTabDataVolumeStatus from './tables/VirtualMachineDiagnosticTabDataVolumeStatus';
import VirtualMachineDiagnosticTabVolumeStatus from './tables/VirtualMachineDiagnosticTabVolumeStatus';
import {
  CONDITION_TO_SEVERITY,
  createEmptyFilters,
  SEVERITY_TO_CONDITION,
} from './utils/constants';
import { DiagnosticSeverity } from './utils/types';
import { createURLDiagnostic, isActiveFilter } from './utils/utils';
import VirtualMachineLogViewer from './VirtualMachineLogViewer/VirtualMachineLogViewer';

import './virtual-machine-diagnostic-tab.scss';

const VirtualMachineDiagnosticTab: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useKubevirtTranslation();
  const diagnosticData = useDiagnosticData(vm);
  const { filterCounts, severityCounts } = useDiagnosticCounts(diagnosticData);

  const [activeTabKey, setActiveTabKey] = useState<string>();
  const [filters, setFilters] = useState(createEmptyFilters);
  const [searchText, setSearchText] = useState('');

  const filtering = isActiveFilter(filters, searchText);
  const { filteredConditions, filteredDataVolumes, filteredVolumeSnapshots } =
    useFilteredDiagnosticData(diagnosticData, filters, searchText);
  const hasFilteredResults =
    !isEmpty(filteredConditions) ||
    !isEmpty(filteredVolumeSnapshots) ||
    !isEmpty(filteredDataVolumes);

  const vmUid = vm?.metadata?.uid;

  useEffect(() => {
    setActiveTabKey(
      location?.pathname?.endsWith(VirtualMachineDetailsTab.Logs)
        ? VirtualMachineDetailsTab.Logs
        : VirtualMachineDetailsTab.Tables,
    );
  }, [location.pathname]);

  useEffect(() => {
    setFilters(createEmptyFilters());
    setSearchText('');
  }, [vmUid]);

  const activeSeverity: DiagnosticSeverity | null =
    filters.conditions.size === 1 && filters.categories.size === 0
      ? (CONDITION_TO_SEVERITY[[...filters.conditions][0]] ?? null)
      : null;

  const handleCardClick = useCallback(
    (severity: DiagnosticSeverity | null) => {
      setSearchText('');
      if (!severity || severity === activeSeverity) {
        setFilters(createEmptyFilters());
      } else {
        setFilters({
          categories: new Set(),
          conditions: new Set([SEVERITY_TO_CONDITION[severity]]),
        });
      }
    },
    [activeSeverity],
  );

  return (
    <PageSection className="VirtualMachineDiagnosticTab" hasBodyWrapper={false}>
      <div className="VirtualMachineDiagnosticTab__body">
        <Tabs
          onSelect={(_, key: string) => {
            navigate(createURLDiagnostic(location.pathname, key));
            setActiveTabKey(key);
          }}
          activeKey={activeTabKey}
          className="VirtualMachineDiagnosticTab__tabs"
          isVertical
        >
          <Tab
            className="VirtualMachineDiagnosticTab__content"
            data-test="vm-diagnostics-status-conditions"
            eventKey={VirtualMachineDetailsTab.Tables}
            title={<TabTitleText>{t('Status & Conditions')}</TabTitleText>}
          >
            <DiagnosticsOverview
              activeSeverity={activeSeverity}
              counts={severityCounts}
              onSeverityChange={handleCardClick}
            />
            <DiagnosticsIssuesToolbar
              filterCounts={filterCounts}
              filters={filters}
              onFiltersChange={setFilters}
              onSearchChange={setSearchText}
              searchText={searchText}
            />
            {filtering && !hasFilteredResults ? (
              <DiagnosticsEmptyFilterState onClearFilters={() => handleCardClick(null)} />
            ) : (
              <>
                <VirtualMachineDiagnosticTabConditions conditions={filteredConditions} />
                <VirtualMachineDiagnosticTabVolumeStatus
                  volumeSnapshotStatuses={filteredVolumeSnapshots}
                />
                <VirtualMachineDiagnosticTabDataVolumeStatus
                  dataVolumesStatuses={filteredDataVolumes}
                />
              </>
            )}
          </Tab>
          <Tab
            className="VirtualMachineDiagnosticTab__content"
            data-test="vm-diagnostics-guest-system-log"
            eventKey={VirtualMachineDetailsTab.Logs}
            title={<TabTitleText>{t('Guest system log')}</TabTitleText>}
          >
            <VirtualMachineLogViewer
              connect={activeTabKey === VirtualMachineDetailsTab.Logs}
              vm={vm}
            />
          </Tab>
        </Tabs>
      </div>
    </PageSection>
  );
};

export default VirtualMachineDiagnosticTab;
