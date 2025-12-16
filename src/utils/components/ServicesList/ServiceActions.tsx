import React from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { modelToRef, ServiceModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';

import LazyActionMenu from '../LazyActionMenu/LazyActionMenu';

type ServiceActionsProps = {
  service: IoK8sApiCoreV1Service;
};

const ServiceActions: React.FC<ServiceActionsProps> = ({ service }) => {
  const serviceModelRef = modelToRef({ apiGroup: 'core', ...ServiceModel });

  if (!service) return null;

  return (
    <LazyActionMenu
      context={{ [serviceModelRef]: service }}
      key={getName(service)}
      variant={ActionMenuVariant.KEBAB}
    />
  );
};

export default ServiceActions;
