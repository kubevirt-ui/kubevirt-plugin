import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { CloseIcon } from '@patternfly/react-icons';

type MigrationStatusShellProps = {
  children: ReactNode;
  isTerminal?: boolean;
  onHeaderClose: () => void;
};

const MigrationStatusShell: FC<MigrationStatusShellProps> = ({
  children,
  isTerminal,
  onHeaderClose,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="pf-v6-c-wizard migration-status">
      <div className="pf-v6-c-wizard__header">
        <div className="pf-v6-c-wizard__close">
          <Button
            aria-label={isTerminal ? t('Close') : t('Cancel migration')}
            icon={<CloseIcon />}
            onClick={onHeaderClose}
            variant={ButtonVariant.plain}
          />
        </div>
        <div className="pf-v6-c-wizard__title">
          <h2 className="pf-v6-c-wizard__title-text">{t('Migrate VirtualMachine storage')}</h2>
        </div>
        <div className="pf-v6-c-wizard__description">
          {t('Migrate VirtualMachine storage to a different StorageClass.')}
        </div>
      </div>

      <div className="migration-status__body">{children}</div>
    </div>
  );
};

export default MigrationStatusShell;
