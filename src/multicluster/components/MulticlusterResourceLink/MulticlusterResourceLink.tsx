import type { FC } from 'react';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import type { FleetResourceLinkProps } from '@stolostron/multicluster-sdk';
import { FleetResourceLink } from '@stolostron/multicluster-sdk';

const MulticlusterResourceLink: FC<FleetResourceLinkProps> = (props) =>
  props?.cluster ? <FleetResourceLink {...props} /> : <ResourceLink {...props} />;

export default MulticlusterResourceLink;
