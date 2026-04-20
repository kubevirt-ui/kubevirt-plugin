import React, { FCC } from 'react';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { FleetResourceLink, FleetResourceLinkProps } from '@stolostron/multicluster-sdk';

const MulticlusterResourceLink: FCC<FleetResourceLinkProps> = (props) =>
  props?.cluster ? <FleetResourceLink {...props} /> : <ResourceLink {...props} />;

export default MulticlusterResourceLink;
