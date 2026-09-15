import { type FC } from 'react';
import { Link } from 'react-router';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardTitle, Divider, Grid, GridItem } from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import OverviewDetailsDescriptionList from './components/OverviewDetailsDescriptionList';
import VirtualMachinesOverviewTabDetailsConsoleWrapper from './components/VirtualMachineOverviewTabDetailsConsoleWrapper';

import './virtual-machines-overview-tab-details.scss';

type VirtualMachinesOverviewTabDetailsProps = {
  guestAgentData: V1VirtualMachineInstanceGuestAgentInfo;
  instanceTypeExpandedSpec: V1VirtualMachine;
  isLoading: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabDetails: FC<VirtualMachinesOverviewTabDetailsProps> = ({
  guestAgentData,
  instanceTypeExpandedSpec,
  isLoading,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();

  const cpuMemoryVM =
    instanceTypeExpandedSpec?.metadata?.uid === vm?.metadata?.uid ? instanceTypeExpandedSpec : vm;

  return (
    <div className="VirtualMachinesOverviewTabDetails--details">
      <Card>
        <CardTitle className="pf-v6-u-text-color-subtle card-title">
          <Link
            to={createURL(
              `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Details}`,
              location?.pathname,
            )}
          >
            {t('Details')}
          </Link>
        </CardTitle>
        <Divider />
        <CardBody isFilled>
          <Grid>
            <GridItem span={5}>
              <OverviewDetailsDescriptionList
                cpuMemoryVM={cpuMemoryVM}
                guestAgentData={guestAgentData}
                isLoading={isLoading}
                vm={vm}
                vmi={vmi}
              />
            </GridItem>
            <GridItem span={1} />
            <GridItem span={5}>
              <div className="right-column">
                <div className="title">{t('VNC console')}</div>
                <VirtualMachinesOverviewTabDetailsConsoleWrapper vm={vm} vmi={vmi} />
              </div>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabDetails;
