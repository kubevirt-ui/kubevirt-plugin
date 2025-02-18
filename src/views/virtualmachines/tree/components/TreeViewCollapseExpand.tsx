import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

import CollapseAllIcon from '../icons/CollapseAllIcon';
import ExpandAllIcon from '../icons/ExpandAllIcon';

type TreeViewCollapseExpandProps = {
  setShowAll: Dispatch<SetStateAction<boolean>>;
  showAll: boolean;
};

const TreeViewCollapseExpand: FC<TreeViewCollapseExpandProps> = ({ setShowAll, showAll }) => {
  const { t } = useKubevirtTranslation();
  return (
    <Tooltip content={showAll ? t('Collapse all') : t('Expand all')}>
      <Button
        className="vms-tree-view__expand"
        icon={showAll ? <CollapseAllIcon /> : <ExpandAllIcon />}
        onClick={() => setShowAll((prev) => !prev)}
        variant={ButtonVariant.plain}
      />
    </Tooltip>
  );
};

export default TreeViewCollapseExpand;
