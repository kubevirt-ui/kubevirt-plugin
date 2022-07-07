import * as React from 'react';
import { Link } from 'react-router-dom';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import InstallPlanModel from '@kubevirt-ui/kubevirt-api/console/models/InstallPlanModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { SubscriptionKind } from '../../../utils/types';

import BlueArrowCircleUpIcon from './BlueArrowCircleUpIcon';

const resourcePathFromModel = (model: K8sModel, name?: string, namespace?: string) => {
  const { plural, namespaced, crd } = model;

  let url = '/k8s/';

  if (!namespaced) {
    url += 'cluster/';
  }

  if (namespaced) {
    url += namespace ? `ns/${namespace}/` : 'all-namespaces/';
  }

  if (crd) {
    url += modelToGroupVersionKind(model);
  } else if (plural) {
    url += plural;
  }

  if (name) {
    // Some resources have a name that needs to be encoded. For instance,
    // Users can have special characters in the name like `#`.
    url += `/${encodeURIComponent(name)}`;
  }

  return url;
};

const UpgradeApprovalLink: React.FC<{ subscription: SubscriptionKind }> = ({ subscription }) => {
  const { t } = useKubevirtTranslation();
  const to = resourcePathFromModel(
    InstallPlanModel,
    subscription.status.installPlanRef.name,
    subscription.metadata.namespace,
  );
  return (
    <span className="co-icon-and-text">
      <Link to={to}>
        <BlueArrowCircleUpIcon /> {t('Upgrade available')}
      </Link>
    </span>
  );
};

export default UpgradeApprovalLink;
