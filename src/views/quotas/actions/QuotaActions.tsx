import React, { FC } from 'react';

import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';

import { useQuotaActions } from './useQuotaActions';

type QuotaActionProps = {
  isKebabToggle?: boolean;
  quota: ApplicationAwareQuota;
};

const QuotaActions: FC<QuotaActionProps> = ({ isKebabToggle, quota }) => {
  const actions = useQuotaActions(quota);

  return <ActionsDropdown actions={actions} isKebabToggle={isKebabToggle} />;
};

export default QuotaActions;
