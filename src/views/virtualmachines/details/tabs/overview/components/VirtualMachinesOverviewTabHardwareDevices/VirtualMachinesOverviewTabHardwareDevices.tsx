import * as React from 'react';

import { V1GPU, V1HostDevice, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardTitle,
  Divider,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';

import useHardwareDevicesColumns from './hooks/useHardwareDevicesColumns';
import VirtualMachinesOverviewTabHardwareDevicesRow from './VirtualMachinesOverviewTabHardwareDevicesRow';

import './virtual-machines-overview-tab-hardware-devices.scss';
type VirtualMachinesOverviewTabHardwareDevicesProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabHardwareDevices: React.FC<
  VirtualMachinesOverviewTabHardwareDevicesProps
> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const columns = useHardwareDevicesColumns();
  const [activeTabKey, setActiveTabKey] = React.useState<number | string>(0);
  const hostDevices = getHostDevices(vm);
  const hostDevicesCount = hostDevices?.length;
  const gpus = getGPUDevices(vm);
  const gpusCount = gpus?.length;

  const handleTabClick = (
    _: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: number | string,
  ) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <div className="VirtualMachinesOverviewTabHardware--main">
      <Card>
        <CardTitle className="text-muted">
          {t('Hardware devices ({{count}})', { count: hostDevicesCount + gpusCount })}
        </CardTitle>
        <Divider />
        <CardBody isFilled>
          <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
            <Tab
              eventKey={0}
              title={<TabTitleText>{t('GPU devices ({{gpusCount}})', { gpusCount })}</TabTitleText>}
            >
              <VirtualizedTable<V1GPU>
                columns={columns}
                data={gpus}
                loaded
                loadError={false}
                Row={VirtualMachinesOverviewTabHardwareDevicesRow}
                unfilteredData={gpus}
              />
            </Tab>
            <Tab
              title={
                <TabTitleText>
                  {t('Host devices ({{hostDevicesCount}})', { hostDevicesCount })}
                </TabTitleText>
              }
              eventKey={1}
            >
              <VirtualizedTable<V1HostDevice>
                columns={columns}
                data={hostDevices}
                loaded
                loadError={false}
                Row={VirtualMachinesOverviewTabHardwareDevicesRow}
                unfilteredData={hostDevices}
              />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabHardwareDevices;
