import React, { FC } from 'react';

import PendingChangesBreadcrumb from '@kubevirt-utils/components/PendingChanges/PendingChangesBreadcrumb/PendingChangesBreadcrumb';
import { PendingChange } from '@kubevirt-utils/components/PendingChanges/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { List } from '@patternfly/react-core';

type PendingChangesProps = {
  pendingChanges: PendingChange[];
};

const PendingChanges: FC<PendingChangesProps> = ({ pendingChanges }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {t('The following areas have pending changes.')}
      <List>
        <PendingChangesBreadcrumb pendingChanges={pendingChanges} />
      </List>
    </>
  );
};

export default PendingChanges;
