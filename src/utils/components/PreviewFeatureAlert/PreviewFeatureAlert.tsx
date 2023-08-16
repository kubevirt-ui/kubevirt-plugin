import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { getOverviewSettingsPath } from '@kubevirt-utils/components/PreviewFeatureAlert/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';

import './PreviewFeatureAlert.scss';

type PreviewFeatureAlertProps = {
  onClose: () => void;
};

const PreviewFeatureAlert: FC<PreviewFeatureAlertProps> = ({ onClose }) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();

  return (
    <Alert
      className="preview-features-alert"
      isInline
      title={t('Hot-Plug is a Technology Preview Feature')}
      variant={AlertVariant.info}
    >
      <Stack hasGutter>
        <StackItem>
          {t(
            'Adding a bridged network interface to a running VirtualMachine is a Technology Preview feature that allows you to choose between live-migrating the VirtualMachine or restarting it to apply the changes. Enabling this feature requires cluster admin permissions.',
          )}
        </StackItem>
        <StackItem>
          <span onClick={onClose}>
            <Link to={getOverviewSettingsPath(activeNamespace)}>
              {t('Go to the Virtualization Settings tab to enable this feature')}
            </Link>
          </span>
        </StackItem>
      </Stack>
    </Alert>
  );
};

export default PreviewFeatureAlert;
