import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import './template-header-alert.scss';

const NoPermissionTemplateAlert: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Alert
      className="alert-margin-top-bottom template-header-alert"
      isInline
      variant={AlertVariant.info}
      title={t("You're in view-only mode")}
    >
      {t('To edit this template, contact your administrator.')}
    </Alert>
  );
};

export default NoPermissionTemplateAlert;
