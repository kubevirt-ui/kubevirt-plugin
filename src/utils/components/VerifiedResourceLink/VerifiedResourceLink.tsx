import { type FC, type ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import isResourceNotFoundError from '@kubevirt-utils/utils/isResourceNotFoundError';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import {
  type K8sResourceCommon,
  type ResourceLinkProps,
} from '@openshift-console/dynamic-plugin-sdk';
import { Skeleton, Tooltip } from '@patternfly/react-core';

import VerifiedResourceLinkDisconnectState from './VerifiedResourceLinkDisconnectState';

export type VerifiedResourceLinkProps = ResourceLinkProps & {
  cluster?: string;
  dataTest?: string;
  missingTooltip?: string;
  tooltipContent?: (resource: K8sResourceCommon) => ReactNode;
};

const VerifiedResourceLink: FC<VerifiedResourceLinkProps> = ({
  cluster,
  dataTest,
  groupVersionKind,
  missingTooltip,
  name,
  namespace,
  tooltipContent,
  ...resourceLinkProps
}) => {
  const { t } = useKubevirtTranslation();

  const [resource, loaded, error] = useK8sWatchData<K8sResourceCommon>({
    cluster,
    groupVersionKind,
    name,
    namespace,
  });

  const linkProps = {
    cluster,
    dataTest,
    groupVersionKind,
    name,
    namespace,
    ...resourceLinkProps,
  };

  if (!loaded && isEmpty(error)) {
    return <Skeleton width="120px" />;
  }

  const isMissing =
    isResourceNotFoundError(error) || (isEmpty(error) && isEmpty(resource) && !isEmpty(name));

  if (isMissing) {
    return (
      <VerifiedResourceLinkDisconnectState
        dataTest={dataTest}
        displayName={resourceLinkProps.displayName}
        name={name}
        tooltipContent={missingTooltip ?? t('This resource has been deleted or cannot be found.')}
      />
    );
  }

  if (tooltipContent && resource) {
    return (
      <Tooltip content={tooltipContent(resource)}>
        <span className="pf-v6-u-display-inline-block">
          <MulticlusterResourceLink {...linkProps} />
        </span>
      </Tooltip>
    );
  }

  return <MulticlusterResourceLink {...linkProps} />;
};

export default VerifiedResourceLink;
