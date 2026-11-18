import { type FC } from 'react';
import { type TFunction } from 'i18next';

import { Tooltip } from '@patternfly/react-core';
import { ClusterIcon } from '@patternfly/react-icons';

type ClusterTreeIconProps = {
  t: TFunction;
};

const ClusterTreeIcon: FC<ClusterTreeIconProps> = ({ t }) => (
  <Tooltip content={t('Cluster')}>
    <ClusterIcon />
  </Tooltip>
);

export default ClusterTreeIcon;
