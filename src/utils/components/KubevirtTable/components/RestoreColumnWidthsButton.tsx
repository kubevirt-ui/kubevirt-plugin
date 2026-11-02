import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumnWidths from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumnWidths';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { UndoIcon } from '@patternfly/react-icons';

type RestoreColumnWidthsButtonProps = {
  tableId: string;
};

const RestoreColumnWidthsButton: FC<RestoreColumnWidthsButtonProps> = ({ tableId }) => {
  const { t } = useKubevirtTranslation();
  const { resetColumnWidths } = useKubevirtUserSettingsTableColumnWidths(tableId);

  return (
    <Tooltip content={t('Reset column widths')} trigger="mouseenter focus">
      <Button
        aria-label={t('Reset column widths')}
        data-test="reset-column-widths"
        icon={<UndoIcon />}
        onClick={resetColumnWidths}
        variant={ButtonVariant.plain}
      />
    </Tooltip>
  );
};

export default RestoreColumnWidthsButton;
