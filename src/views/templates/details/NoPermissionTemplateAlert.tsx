import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

const NoPermissionTemplateAlert: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Alert
      className="alert-margin-top-bottom template-header-alert"
      isInline
      title={t("You're in view-only mode")}
      variant={AlertVariant.info}
    >
      {t('To edit this template, contact your administrator.')}
    </Alert>
  );
};

export default NoPermissionTemplateAlert;
