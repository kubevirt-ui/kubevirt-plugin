import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HardwareDevicesList from '@kubevirt-utils/components/HardwareDevices/list/HardwareDevicesList';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { hasS390xArchitecture } from '@kubevirt-utils/resources/vm/utils/architecture';
import {
  Card,
  CardBody,
  CardTitle,
  Divider,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';

type VirtualMachinesOverviewTabHardwareDevicesProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabHardwareDevices: FC<
  VirtualMachinesOverviewTabHardwareDevicesProps
> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(0);

  const hostDevices = getHostDevices(vm);
  const hostDevicesCount = hostDevices?.length ?? 0;
  const gpus = getGPUDevices(vm);
  const gpusCount = gpus?.length ?? 0;
  const vmHasS390xArchitecture = hasS390xArchitecture(vm);

  const handleTabClick = (
    _: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: number | string,
  ) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Card data-test="overview-hardware-devices-card">
      <CardTitle className="pf-v6-u-text-color-subtle">
        {t('Hardware devices ({{devices}})', { devices: hostDevicesCount + gpusCount })}
      </CardTitle>
      <Divider />
      <CardBody isFilled>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
          {!vmHasS390xArchitecture && (
            <Tab
              eventKey={0}
              title={<TabTitleText>{t('GPU devices ({{gpusCount}})', { gpusCount })}</TabTitleText>}
            >
              <div className="kubevirt-table--tabs-content kubevirt-table--in-card">
                <HardwareDevicesList
                  devices={gpus}
                  noDataEmptyMsg={t('No GPU devices found')}
                  showActions={false}
                />
              </div>
            </Tab>
          )}
          <Tab
            title={
              <TabTitleText>
                {t('Host devices ({{hostDevicesCount}})', { hostDevicesCount })}
              </TabTitleText>
            }
            eventKey={vmHasS390xArchitecture ? 0 : 1}
          >
            <div className="kubevirt-table--tabs-content kubevirt-table--in-card">
              <HardwareDevicesList
                devices={hostDevices}
                noDataEmptyMsg={t('No host devices found')}
                showActions={false}
              />
            </div>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabHardwareDevices;
