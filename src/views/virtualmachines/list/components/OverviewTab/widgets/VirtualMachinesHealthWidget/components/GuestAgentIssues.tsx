import React, { FC, useMemo } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { countVMsWithoutGuestAgent } from '@kubevirt-utils/resources/vmi/utils/guest-agent';
import { Card, CardBody, CardHeader, CardTitle, Grid } from '@patternfly/react-core';

import StatusCountItem from '../../shared/StatusCountItem';

import './health-card.scss';

type GuestAgentIssuesProps = {
  vmis: V1VirtualMachineInstance[];
  vms: V1VirtualMachine[];
};

const GuestAgentIssues: FC<GuestAgentIssuesProps> = ({ vmis, vms }) => {
  const { t } = useKubevirtTranslation();

  const vmsNotReporting = useMemo(() => countVMsWithoutGuestAgent(vms, vmis), [vms, vmis]);

  return (
    <Card
      className="guest-agent-issues health-card"
      data-test="guest-agent-issues-widget"
      isCompact
    >
      <CardHeader className="health-card__header">
        <CardTitle>{t('Guest agent status')}</CardTitle>
      </CardHeader>
      <CardBody>
        <Grid hasGutter>
          <StatusCountItem count={vmsNotReporting} label={t('VMs not reporting')} span={6} />
        </Grid>
      </CardBody>
    </Card>
  );
};

export default GuestAgentIssues;
