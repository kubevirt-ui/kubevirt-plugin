import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ApplicationAwareResourceQuota } from '@kubevirt-utils/resources/quotas/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';

import { getQuotaCreateFormYAMLURL, getQuotaEditFormYAMLURL } from '../utils/url';

type AdvancedConfigAlertProps = {
  isEdit: boolean;
  quota: ApplicationAwareResourceQuota;
};

const AdvancedConfigAlert: FC<AdvancedConfigAlertProps> = ({ isEdit, quota }) => {
  const { t } = useKubevirtTranslation();
  const [isAlertOpen, setIsAlertOpen] = useState(true);

  if (!isAlertOpen) {
    return null;
  }

  return (
    <Alert
      actionLinks={
        <Link
          to={
            isEdit
              ? getQuotaEditFormYAMLURL(getName(quota), getNamespace(quota))
              : getQuotaCreateFormYAMLURL(getNamespace(quota))
          }
        >
          {t('View YAML')}
        </Link>
      }
      actionClose={<AlertActionCloseButton onClose={() => setIsAlertOpen(false)} />}
      isInline
      title={t('Advanced quota configuration detected')}
      variant="warning"
    >
      <p>
        {t(
          'This quota contains advanced settings (such as pod limits) that cannot be displayed in this simplified form. These configurations remain active and can be viewed or edited in the YAML view.',
        )}
      </p>
    </Alert>
  );
};

export default AdvancedConfigAlert;
