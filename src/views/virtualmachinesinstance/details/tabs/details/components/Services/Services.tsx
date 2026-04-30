import React from 'react';

import { modelToGroupVersionKind, ServiceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import ServicesList from '@kubevirt-utils/components/ServicesList/ServicesList';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { usePods } from '@kubevirt-utils/hooks/usePods';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getServicesForVmi } from '@kubevirt-utils/resources/vmi';
import { getVMIPod } from '@kubevirt-utils/resources/vmi/utils/pod';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Icon, Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

const Services = ({ pathname, vmi }) => {
  const { t } = useKubevirtTranslation();

  const [services, loaded, loadError] = useK8sWatchData<IoK8sApiCoreV1Service[]>({
    cluster: getCluster(vmi),
    groupVersionKind: modelToGroupVersionKind(ServiceModel),
    isList: true,
    namespace: getNamespace(vmi),
  });

  const [pods, podsLoaded] = usePods(getNamespace(vmi), getCluster(vmi));
  const pod = getVMIPod(vmi, pods);
  const data = getServicesForVmi(services, pod, undefined, vmi);

  return (
    <div>
      <a className="link-icon" href={`${pathname}#services`}>
        <Icon size="sm">
          <LinkIcon />
        </Icon>
      </a>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Services')}
      </Title>
      <ServicesList data={data} loaded={loaded && podsLoaded} loadError={loadError} />
    </div>
  );
};

export default Services;
