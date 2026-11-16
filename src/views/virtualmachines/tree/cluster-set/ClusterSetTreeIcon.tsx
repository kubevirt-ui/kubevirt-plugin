import { type FC } from 'react';
import { type TFunction } from 'i18next';

import { Tooltip } from '@patternfly/react-core';
import { FolderOpenIcon } from '@patternfly/react-icons';

type ClusterSetTreeIconProps = {
  t: TFunction;
};

const ClusterSetTreeIcon: FC<ClusterSetTreeIconProps> = ({ t }) => (
  <Tooltip content={t('Cluster set')}>
    <FolderOpenIcon />
  </Tooltip>
);

export default ClusterSetTreeIcon;
