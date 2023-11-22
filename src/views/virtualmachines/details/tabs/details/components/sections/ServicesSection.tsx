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

const ServicesSection = ({ pathname, vm }) => {
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
    <div className="VirtualMachinesDetailsSection">
      <a className="link-icon" href={`${pathname}#services`}>
        <LinkIcon size="sm" />
      </a>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Services')}
      </Title>
      <ServicesList data={data || []} loaded={loaded} />
    </div>
  );
};

export default ServicesSection;
