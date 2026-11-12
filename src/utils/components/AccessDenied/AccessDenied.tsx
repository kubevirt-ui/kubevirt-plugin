import type { FC, ReactNode } from 'react';

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
  /** Compact inline warning for dashboard cards / widgets. */
  inline?: boolean;
  message?: ReactNode;
};

const AccessDenied: FC<AccessDeniedProps> = ({ inline = false, message }) => {
  const { t } = useKubevirtTranslation();
  const title = t('Access Restricted');
  const description = t(
    'You do not have the required permissions to view this information. Please contact your OpenShift administrator if you need access.',
  );

  if (inline) {
    return (
      <Alert isInline title={title} variant={AlertVariant.warning}>
        {description}
      </Alert>
    );
  }

  return (
    <Panel className="kv-access-denied">
      <PanelMain>
        <PanelMainBody>
          <div className="pf-v6-u-text-align-center">
            <img alt="" src={restrictedSignImg} />
          </div>
          <Title className="pf-v6-u-text-align-center" headingLevel="h2">
            {title}
          </Title>

          <div className="pf-v6-u-text-align-center">{description}</div>
          {message && (
            <Alert isInline title={t('Details')} variant={AlertVariant.warning}>
              {message}
            </Alert>
          )}
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

export default AccessDenied;
