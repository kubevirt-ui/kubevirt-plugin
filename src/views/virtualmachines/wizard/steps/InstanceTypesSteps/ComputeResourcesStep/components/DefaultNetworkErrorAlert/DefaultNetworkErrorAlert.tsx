import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import isResourceNotFoundError from '@kubevirt-utils/utils/isResourceNotFoundError';
import { Alert, AlertVariant } from '@patternfly/react-core';

type DefaultNetworkErrorAlertProps = {
  defaultNadError?: Error;
  defaultNadName?: string;
  project?: string;
};

const DefaultNetworkErrorAlert: FC<DefaultNetworkErrorAlertProps> = ({
  defaultNadError,
  defaultNadName,
  project,
}) => {
  const { t } = useKubevirtTranslation();

  if (!defaultNadError) return null;

  const networkName = defaultNadName ?? t('Unknown');
  const projectName = project ?? t('Unknown');
  const message = isResourceNotFoundError(defaultNadError)
    ? t(
        'NetworkAttachmentDefinition "{{name}}", configured as the default network for project "{{project}}", was not found.',
        { name: networkName, project: projectName },
      )
    : t(
        'NetworkAttachmentDefinition "{{name}}", configured as the default network for project "{{project}}", could not be loaded.',
        { name: networkName, project: projectName },
      );

  return (
    <Alert
      data-test="default-network-error-alert"
      isInline
      title={t('Default network is unavailable')}
      variant={AlertVariant.danger}
    >
      {message}
    </Alert>
  );
};

export default DefaultNetworkErrorAlert;
