import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import useVMStatusesPath from '@overview/OverviewTab/vm-statuses-card/hooks/useVMStatusesPath';
import { ERROR, OTHER } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import {
  getOtherStatuses,
  getVMStatuses,
  vmStatusIcon,
} from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Card, CardBody, CardHeader, CardTitle, Grid } from '@patternfly/react-core';

import StatusCountItem from '../../shared/StatusCountItem';

import './health-card.scss';

type VMStatusesProps = {
  vms: V1VirtualMachine[];
};

const VMStatuses: FC<VMStatusesProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const namespace = useNamespaceParam();

  const OTHER_STATUSES = getOtherStatuses();
  const { otherStatusesCount, primaryStatuses } = getVMStatuses(vms || []);

  const errorPath = useVMStatusesPath(namespace, [ERROR]);
  const runningPath = useVMStatusesPath(namespace, [VM_STATUS.Running]);
  const stoppedPath = useVMStatusesPath(namespace, [VM_STATUS.Stopped]);
  const otherPath = useVMStatusesPath(namespace, OTHER_STATUSES);

  return (
    <Card className="vm-statuses-card health-card" data-test="vm-statuses-card" isCompact>
      <CardHeader className="health-card__header">
        <CardTitle>{t('Virtual machine statuses')}</CardTitle>
      </CardHeader>
      <CardBody>
        <Grid hasGutter>
          <StatusCountItem
            count={primaryStatuses.Error}
            icon={<vmStatusIcon.Error />}
            label={t('Error')}
            linkPath={errorPath}
            span={3}
          />
          <StatusCountItem
            count={primaryStatuses.Running}
            icon={<vmStatusIcon.Running />}
            label={t('Running')}
            linkPath={runningPath}
            span={3}
          />
          <StatusCountItem
            count={primaryStatuses.Stopped}
            icon={<vmStatusIcon.Stopped />}
            label={t('Stopped')}
            linkPath={stoppedPath}
            span={3}
          />
          <StatusCountItem
            count={otherStatusesCount}
            icon={<vmStatusIcon.Other />}
            label={t(OTHER)}
            linkPath={otherPath}
            span={3}
          />
        </Grid>
      </CardBody>
    </Card>
  );
};

export default VMStatuses;
