import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { UndoIcon } from '@patternfly/react-icons';

type RestoreColumnWidthsButtonProps = {
  asToolbarItem?: boolean;
  onRestoreColumnWidths: () => void;
};

const RestoreColumnWidthsButton: FC<RestoreColumnWidthsButtonProps> = ({
  asToolbarItem = false,
  onRestoreColumnWidths,
}) => {
  const { t } = useKubevirtTranslation();

  const button = (
    <Tooltip content={t('Reset column widths')} trigger="mouseenter focus">
      <Button
        aria-label={t('Reset column widths')}
        className={asToolbarItem ? undefined : 'kubevirt-table-toolbar-action'}
        data-test="reset-column-widths"
        icon={<UndoIcon />}
        onClick={onRestoreColumnWidths}
        variant={ButtonVariant.plain}
      />
    </Tooltip>
  );

  if (asToolbarItem) {
    return <ToolbarItem>{button}</ToolbarItem>;
  }

  return button;
};

export default RestoreColumnWidthsButton;
