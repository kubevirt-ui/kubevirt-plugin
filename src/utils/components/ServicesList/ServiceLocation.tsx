import React, { type FC } from 'react';

import { type IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

type ServiceLocationProps = {
  service: IoK8sApiCoreV1Service;
};

const ServiceLocation: FC<ServiceLocationProps> = ({ service }) => {
  const { t } = useKubevirtTranslation();

  if (!service) {
    return null;
  }

  switch (service.spec?.type) {
    case 'NodePort': {
      const clusterIP = service.spec.clusterIP ? `${service.spec.clusterIP}:` : '';
      return (
        <>
          {service.spec.ports?.map((portObj) => (
            <div
              className="co-truncate co-select-to-copy"
              key={`${portObj.port}-${portObj.protocol}`}
            >
              {clusterIP}
              {portObj.nodePort}
            </div>
          ))}
        </>
      );
    }

    case 'LoadBalancer': {
      if (!service.status?.loadBalancer?.ingress?.length) {
        return <div className="co-truncate">{t('Pending')}</div>;
      }
      return (
        <>
          {service.status.loadBalancer.ingress.map((ingress) => (
            <div className="co-truncate co-select-to-copy" key={ingress.hostname ?? ingress.ip}>
              {ingress.hostname ?? ingress.ip ?? NO_DATA_DASH}
            </div>
          ))}
        </>
      );
    }

    case 'ExternalName': {
      return (
        <>
          {service.spec.ports?.map((portObj) => {
            const externalName = service.spec.externalName ? `${service.spec.externalName}:` : '';
            return (
              <div
                className="co-truncate co-select-to-copy"
                key={`${portObj.port}-${portObj.protocol}`}
              >
                {externalName}
                {portObj.port}
              </div>
            );
          })}
        </>
      );
    }

    default: {
      if (service.spec.clusterIP === 'None') {
        return <div className="co-truncate">{t('None')}</div>;
      }
      return (
        <>
          {service.spec.ports?.map((portObj) => {
            const clusterIP = service.spec.clusterIP ? `${service.spec.clusterIP}:` : '';
            return (
              <div
                className="co-truncate co-select-to-copy"
                key={`${portObj.port}-${portObj.protocol}`}
              >
                {clusterIP}
                {portObj.port}
              </div>
            );
          })}
        </>
      );
    }
  }
};

export default ServiceLocation;
