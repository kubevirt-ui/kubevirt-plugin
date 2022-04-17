import * as React from 'react';

import { modelToGroupVersionKind, ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { getServicesForVmi } from '@kubevirt-utils/resources/vmi';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ServicesList } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

const ServicesSection = ({ vm, pathname }) => {
  const { t } = useKubevirtTranslation();

  const [services, loaded] = useK8sWatchResource<IoK8sApiCoreV1Service[]>({
    groupVersionKind: modelToGroupVersionKind(ServiceModel),
    isList: true,
    namespace: vm?.metadata?.namespace,
  });
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);

  const data = getServicesForVmi(services, vmi);

  return (
    <div className="VirtualMachinesDetailsSection">
      <a href={`${pathname}#services`} className="link-icon">
        <LinkIcon size="sm" />
      </a>
      <Title headingLevel="h2" className="co-section-heading">
        {t('Services')}
      </Title>
      <ServicesList loaded={loaded} data={data || []} />
    </div>
  );
};

export default ServicesSection;
