import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { countVMsWithoutGuestAgent } from '@kubevirt-utils/resources/vmi/utils/guest-agent';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Card, CardBody, CardHeader, CardTitle, Grid } from '@patternfly/react-core';

import StatusCountItem from '../../shared/StatusCountItem';
import { buildGuestAgentNotReportingPath } from '../utils/guestAgentPaths';

import './health-card.scss';

type GuestAgentIssuesProps = {
  vms: V1VirtualMachine[];
};

const GuestAgentIssues: FC<GuestAgentIssuesProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const namespace = useNamespaceParam();
  const cluster = useActiveClusterParam();
  const isACMPage = useIsACMPage();

  const vmsNotReporting = useMemo(() => countVMsWithoutGuestAgent(vms), [vms]);

  const notReportingPath = useMemo(
    () => buildGuestAgentNotReportingPath(isACMPage, cluster, namespace),
    [isACMPage, cluster, namespace],
  );

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
          <StatusCountItem
            helpContent={t(
              'A VM will stop reporting if the guest agent is missing, the guest OS becomes unresponsive or the monitoring stack fails.',
            )}
            count={vmsNotReporting}
            href={notReportingPath}
            label={t('VMs not reporting')}
            span={6}
          />
        </Grid>
      </CardBody>
    </Card>
  );
};

export default GuestAgentIssues;
