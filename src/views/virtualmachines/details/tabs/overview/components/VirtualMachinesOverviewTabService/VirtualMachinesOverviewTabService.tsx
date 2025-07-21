import React, { FC } from 'react';

import { modelToGroupVersionKind, ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { getServicesForVmi } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { ServicesList } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Card, CardBody, CardTitle, Divider } from '@patternfly/react-core';

type VirtualMachinesOverviewTabServiceProps = { vm: V1VirtualMachine };

const VirtualMachinesOverviewTabService: FC<VirtualMachinesOverviewTabServiceProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const [services, loaded] = useK8sWatchData<IoK8sApiCoreV1Service[]>({
    cluster: getCluster(vm),
    groupVersionKind: modelToGroupVersionKind(ServiceModel),
    isList: true,
    namespace: vm?.metadata?.namespace,
  });

  const { vmi } = useVMIAndPodsForVM(getName(vm), getNamespace(vm), getCluster(vm));

  const data = getServicesForVmi(
    services,
    vmi?.metadata?.labels || vm?.spec?.template?.metadata?.labels,
  );

  return (
    <Card>
      <CardTitle className="pf-v6-u-text-color-subtle">
        {t('Services ({{services}})', { services: data?.length })}
      </CardTitle>
      <Divider />
      <CardBody isFilled>
        {!isEmpty(ServicesList) && <ServicesList data={data} loaded={loaded} />}
      </CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabService;
