import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';

type QuotasCreateButtonProps = {
  namespace?: string;
};

const QuotasCreateButton: FC<QuotasCreateButtonProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  return (
    <ListPageCreateButton
      onClick={() => navigate(`/k8s/ns/${namespace ?? 'default'}/quotas/~new/form`)}
    >
      {t('Create quota')}
    </ListPageCreateButton>
  );
};

export default QuotasCreateButton;
