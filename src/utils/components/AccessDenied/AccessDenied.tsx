import React, { FC } from 'react';

import restrictedSignImg from '@images/restricted-sign.svg';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, Panel, PanelMain, PanelMainBody, Title } from '@patternfly/react-core';

type AccessDeniedProps = {
  message?: string;
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
          {!isEmpty(message) && (
            <Alert className="co-alert" isInline title={t('Error details')} variant="danger">
              {message}
            </Alert>
          )}
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

export default AccessDenied;
