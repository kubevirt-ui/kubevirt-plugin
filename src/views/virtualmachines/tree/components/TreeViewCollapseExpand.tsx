import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { AngleDoubleDownIcon, AngleDoubleUpIcon } from '@patternfly/react-icons';

type TreeViewCollapseExpandProps = {
  setShowAll: Dispatch<SetStateAction<boolean>>;
  showAll: boolean;
};

const TreeViewCollapseExpand: FC<TreeViewCollapseExpandProps> = ({ setShowAll, showAll }) => {
  const { t } = useKubevirtTranslation();

  const Icon = showAll ? AngleDoubleUpIcon : AngleDoubleDownIcon;

  return (
    <Tooltip content={showAll ? t('Collapse all') : t('Expand all')}>
      <Button
        className="vms-tree-view__expand"
        icon={<Icon color="var(--pf-t--global--icon--color--subtle)" />}
        onClick={() => setShowAll((prev) => !prev)}
        variant={ButtonVariant.plain}
      />
    </Tooltip>
  );
};

export default TreeViewCollapseExpand;
