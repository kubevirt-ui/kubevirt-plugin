import { type FC, type PropsWithChildren } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

type ExistingAccountFieldWrapperProps = PropsWithChildren<{
  canRead: boolean;
  error?: Error;
  loaded: boolean;
}>;

const ExistingAccountFieldWrapper: FC<ExistingAccountFieldWrapperProps> = ({
  canRead,
  children,
  error,
  loaded,
}) => {
  const { t } = useKubevirtTranslation();

  if (error) {
    return (
      <Alert
        isInline
        title={t('ServiceAccounts could not be loaded')}
        variant={AlertVariant.danger}
      >
        {error.message}
      </Alert>
    );
  }

  if (loaded && !canRead) {
    return (
      <Alert
        isInline
        title={t("You don't have permission to read ServiceAccounts in this project")}
        variant={AlertVariant.danger}
      />
    );
  }

  return children;
};

export default ExistingAccountFieldWrapper;
