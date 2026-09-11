import { type ReactNode } from 'react';

import { type IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type ServiceLocationProps = {
  service: IoK8sApiCoreV1Service;
};

const ServiceLocation = ({ service }: ServiceLocationProps): ReactNode => {
  const { t } = useKubevirtTranslation();

  if (!service) {
    return null;
  }

  switch (service.spec?.type) {
    case 'NodePort': {
      const clusterIP = service.spec.clusterIP ? `${service.spec.clusterIP}:` : '';
      return (
        <>
          {service.spec.ports?.map((portObj) => {
            return (
              <div
                className="co-truncate co-select-to-copy"
                key={`${portObj.port}-${portObj.nodePort}`}
              >
                {clusterIP}
                {portObj.nodePort}
              </div>
            );
          })}
        </>
      );
    }

    case 'LoadBalancer': {
      if (!service.status?.loadBalancer?.ingress?.length) {
        return <div className="co-truncate">{t('Pending')}</div>;
      }
      return (
        <>
          {service.status.loadBalancer.ingress.map((ingress) => {
            return (
              <div className="co-truncate co-select-to-copy" key={ingress.hostname ?? ingress.ip}>
                {ingress.hostname ?? ingress.ip ?? '-'}
              </div>
            );
          })}
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
