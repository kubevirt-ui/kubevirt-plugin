import { type FC } from 'react';

import HidableTooltip from '@kubevirt-utils/components/HidableTooltip/HidableTooltip';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Split, SplitItem } from '@patternfly/react-core';
import { MinusCircleIcon, PencilAltIcon } from '@patternfly/react-icons';

type LabelsAnnotationsRowActionsProps = {
  canDelete: boolean;
  canEdit?: boolean;
  deleteTooltip?: string;
  entryKey: string;
  onDelete: (key: string) => void;
  onEdit?: (key: string) => void;
  searchId: string;
};

const LabelsAnnotationsRowActions: FC<LabelsAnnotationsRowActionsProps> = ({
  canDelete,
  canEdit,
  deleteTooltip,
  entryKey,
  onDelete,
  onEdit,
  searchId,
}) => {
  const { t } = useKubevirtTranslation();
  const showDeleteTooltip = !canDelete && Boolean(deleteTooltip);

  const removeButton = (
    <Button
      aria-label={t('Remove {{key}}', { key: entryKey })}
      data-test={`delete-${searchId}-${entryKey}`}
      icon={<MinusCircleIcon />}
      isAriaDisabled={showDeleteTooltip}
      isDisabled={!canDelete && !showDeleteTooltip}
      onClick={() => onDelete(entryKey)}
      variant={ButtonVariant.plain}
    />
  );

  return (
    <Split>
      <SplitItem style={{ visibility: canEdit ? 'visible' : 'hidden' }}>
        <Button
          aria-label={t('Edit {{key}}', { key: entryKey })}
          data-test={`edit-${searchId}-${entryKey}`}
          icon={<PencilAltIcon />}
          onClick={() => onEdit?.(entryKey)}
          variant={ButtonVariant.plain}
        />
      </SplitItem>
      <SplitItem>
        <HidableTooltip content={deleteTooltip} hidden={!showDeleteTooltip}>
          {removeButton}
        </HidableTooltip>
      </SplitItem>
    </Split>
  );
};

export default LabelsAnnotationsRowActions;
