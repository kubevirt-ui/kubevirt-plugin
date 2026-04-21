import React, { FC } from 'react';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { FleetResourceLink, FleetResourceLinkProps } from '@stolostron/multicluster-sdk';

const MulticlusterResourceLink: FC<FleetResourceLinkProps> = (props) =>
  props?.cluster ? <FleetResourceLink {...props} /> : <ResourceLink {...props} />;

export default MulticlusterResourceLink;
