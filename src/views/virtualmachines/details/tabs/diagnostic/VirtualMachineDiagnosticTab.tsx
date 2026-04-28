import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router';

import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PageSection, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import useDiagnosticData from './hooks/useDianosticData';
import VirtualMachineDiagnosticTabConditions from './tables/VirtualMachineDiagnosticTabConditions';
import VirtualMachineDiagnosticTabDataVolumeStatus from './tables/VirtualMachineDiagnosticTabDataVolumeStatus';
import VirtualMachineDiagnosticTabVolumeStatus from './tables/VirtualMachineDiagnosticTabVolumeStatus';
import { createURLDiagnostic } from './utils/utils';
import VirtualMachineLogViewer from './VirtualMachineLogViewer/VirtualMachineLogViewer';

import './virtual-machine-diagnostic-tab.scss';

const VirtualMachineDiagnosticTab: FC<NavPageComponentProps> = ({ obj: vm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useKubevirtTranslation();
  const { conditions, dataVolumesStatuses, volumeSnapshotStatuses } = useDiagnosticData(vm);
  const [activeTabKey, setActiveTabKey] = useState<string>();

  useEffect(() => {
    setActiveTabKey(
      location?.pathname?.endsWith(VirtualMachineDetailsTab.Logs)
        ? VirtualMachineDetailsTab.Logs
        : VirtualMachineDetailsTab.Tables,
    );
  }, [location.pathname]);

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
            data-test-id="vm-diagnostics-status-conditions"
            eventKey={VirtualMachineDetailsTab.Tables}
            title={<TabTitleText>{t('Status & Conditions')}</TabTitleText>}
          >
            <VirtualMachineDiagnosticTabConditions conditions={conditions} />
            <VirtualMachineDiagnosticTabVolumeStatus
              volumeSnapshotStatuses={volumeSnapshotStatuses}
            />
            <VirtualMachineDiagnosticTabDataVolumeStatus
              dataVolumesStatuses={dataVolumesStatuses}
            />
          </Tab>
          <Tab
            className="VirtualMachineDiagnosticTab__content"
            data-test-id="vm-diagnostics-guest-system-log"
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
