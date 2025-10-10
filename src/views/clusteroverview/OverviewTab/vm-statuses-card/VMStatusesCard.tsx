import React, { FC } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ERROR, OTHER } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import {
  getOtherStatuses,
  getVMStatuses,
} from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Card, CardHeader, CardTitle, Divider, Grid } from '@patternfly/react-core';

import VMAdditionalStatuses from './VMAdditionalStatuses';
import VMStatusItem from './VMStatusItem';

import './VMStatusesCard.scss';

const VMStatusesCard: FC = () => {
  const [activeNamespace] = useActiveNamespace();
  const namespace = React.useMemo(
    () => (activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace),
    [activeNamespace],
  );

  const { t } = useKubevirtTranslation();
  const OTHER_STATUSES = getOtherStatuses();

  const [vms] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    namespace: namespace,
    namespaced: Boolean(namespace),
  });

  const { otherStatuses, otherStatusesCount, primaryStatuses } = getVMStatuses(vms || []);

  return (
    <Card className="vm-statuses-card" data-test-id="vm-statuses-card">
      <CardHeader className="vm-statuses-card__header">
        <CardTitle>{t('VirtualMachine statuses')}</CardTitle>
      </CardHeader>
      <div className="vm-statuses-card__body">
        <Grid hasGutter>
          <VMStatusItem
            count={primaryStatuses.Error}
            namespace={activeNamespace}
            statusArray={[ERROR]}
            statusLabel={ERROR}
          />
          <VMStatusItem
            count={primaryStatuses.Running}
            namespace={activeNamespace}
            statusArray={[VM_STATUS.Running]}
            statusLabel={VM_STATUS.Running}
          />
          <VMStatusItem
            count={primaryStatuses.Stopped}
            namespace={activeNamespace}
            statusArray={[VM_STATUS.Stopped]}
            statusLabel={VM_STATUS.Stopped}
          />
          <VMStatusItem
            count={otherStatusesCount}
            namespace={activeNamespace}
            statusArray={OTHER_STATUSES}
            statusLabel={t(OTHER)}
          />
        </Grid>
      </div>
      <Divider />
      <VMAdditionalStatuses
        activeNamespace={activeNamespace}
        otherStatuses={otherStatuses}
        otherStatusesCount={otherStatusesCount}
      />
    </Card>
  );
};

export default VMStatusesCard;
