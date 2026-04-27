import React, { FC, ReactNode } from 'react';

import restrictedSignImg from '@images/restricted-sign.svg';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Panel,
  PanelMain,
  PanelMainBody,
  Title,
} from '@patternfly/react-core';

type AccessDeniedProps = {
  message?: ReactNode;
};

const AccessDenied: FC<AccessDeniedProps> = ({ message }) => {
  const { t } = useKubevirtTranslation();
  return (
    <Panel className="kv-access-denied">
      <PanelMain>
        <PanelMainBody>
          <div className="pf-v6-u-text-align-center">
            <img src={restrictedSignImg} />
          </div>
          <Title className="pf-v6-u-text-align-center" headingLevel="h2">
            {t('Restricted Access')}
          </Title>

          <div className="pf-v6-u-text-align-center" data-test="msg-box-detail">
            {t("You don't have access to this section due to cluster policy.")}
          </div>
          {message && (
            <Alert isInline title={t('Error details')} variant={AlertVariant.danger}>
              {message}
            </Alert>
          )}
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

export default AccessDenied;
