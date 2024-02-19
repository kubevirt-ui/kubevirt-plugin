import React, { FC } from 'react';

import { modelToGroupVersionKind, ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { getServicesForVmi } from '@kubevirt-utils/resources/vmi';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ServicesList } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Card, CardBody, CardTitle, Divider } from '@patternfly/react-core';

type VirtualMachinesOverviewTabServiceProps = { vm: V1VirtualMachine };

const VirtualMachinesOverviewTabService: FC<VirtualMachinesOverviewTabServiceProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const [services, loaded] = useK8sWatchResource<IoK8sApiCoreV1Service[]>({
    groupVersionKind: modelToGroupVersionKind(ServiceModel),
    isList: true,
    namespace: vm?.metadata?.namespace,
  });
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);

  const data = getServicesForVmi(
    services,
    vmi?.metadata?.labels || vm?.spec?.template?.metadata?.labels,
  );

  return (
    <Card>
      <CardTitle className="text-muted">
        {t('Services ({{services}})', { services: data?.length })}
      </CardTitle>
      <Divider />
      <CardBody isFilled>
        <ServicesList data={data || []} loaded={loaded} />
      </CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabService;
