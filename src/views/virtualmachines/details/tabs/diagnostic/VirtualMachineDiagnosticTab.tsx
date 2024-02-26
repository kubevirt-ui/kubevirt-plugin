import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useLocation } from 'react-router-dom-v5-compat';

import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

import useDiagnosticData from './hooks/useDianosticData';
import VirtualMachineDiagnosticTabConditions from './tables/VirtualMachineDiagnosticTabConditions';
import VirtualMachineDiagnosticTabDataVolumeStatus from './tables/VirtualMachineDiagnosticTabDataVolumeStatus';
import VirtualMachineDiagnosticTabVolumeStatus from './tables/VirtualMachineDiagnosticTabVolumeStatus';
import { createURLDiagnostic } from './utils/utils';
import VirtualMachineLogViewer from './VirtualMachineLogViewer/VirtualMachineLogViewer';

import './virtual-machine-diagnostic-tab.scss';

const VirtualMachineDiagnosticTab: FC<NavPageComponentProps> = ({ vm }) => {
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
    <div className="VirtualMachineDiagnosticTab--main">
      <Tabs
        onSelect={(_, key: string) => {
          navigate(createURLDiagnostic(location.pathname, key));
          setActiveTabKey(key);
        }}
        activeKey={activeTabKey}
        className="VirtualMachineDiagnosticTab--main__tabs"
        isVertical
      >
        <Tab
          className="VirtualMachineDiagnosticTab--main__content"
          eventKey={VirtualMachineDetailsTab.Tables}
          title={<TabTitleText>{t('Status & Conditions')}</TabTitleText>}
        >
          <VirtualMachineDiagnosticTabConditions conditions={conditions} />
          <VirtualMachineDiagnosticTabVolumeStatus
            volumeSnapshotStatuses={volumeSnapshotStatuses}
          />
          <VirtualMachineDiagnosticTabDataVolumeStatus dataVolumesStatuses={dataVolumesStatuses} />
        </Tab>
        <Tab
          className="VirtualMachineDiagnosticTab--main__content"
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
  );
};

export default VirtualMachineDiagnosticTab;
