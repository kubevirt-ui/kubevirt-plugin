import React, { FC, useCallback, useMemo, useState } from 'react';

import LabelKeyInput from '@kubevirt-utils/components/LabelsModal/components/LabelKeyInput';
import { AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateLabelEntry } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import {
  Button,
  ButtonVariant,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { CheckIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';

import '@settings/tabs/components/settings-label-cell.scss';

type AutoAppliedLabelKeyCellProps = {
  existingKeys: string[];
  isDisabled: boolean;
  label: AutoAppliedLabel;
  onDelete: () => void;
  onUpdate: (label: AutoAppliedLabel) => void;
};

const AutoAppliedLabelKeyCell: FC<AutoAppliedLabelKeyCellProps> = ({
  existingKeys,
  isDisabled,
  label,
  onDelete,
  onUpdate,
}) => {
  const { t } = useKubevirtTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(label.key);

  const otherKeys = useMemo(
    () => existingKeys.filter((key) => key !== label.key),
    [existingKeys, label.key],
  );
  const keyError = isEditing
    ? validateLabelEntry(editKey, '', t, undefined, [...otherKeys, editKey])
    : undefined;
  const canSave = Boolean(editKey.trim()) && !keyError && !isDisabled;

  const onSave = useCallback((): void => {
    if (!canSave) return;
    onUpdate({ ...label, key: editKey });
    setIsEditing(false);
  }, [canSave, editKey, label, onUpdate]);

  return (
    <>
      <Split className="settings-label-cell__row" hasGutter>
        <SplitItem isFilled>
          {isEditing ? (
            <LabelKeyInput existingKeys={otherKeys} onChange={setEditKey} value={editKey} />
          ) : (
            label.key
          )}
        </SplitItem>
        <SplitItem>
          {isEditing ? (
            <Button
              aria-label={t('Confirm')}
              icon={<CheckIcon />}
              isDisabled={!canSave}
              onClick={onSave}
              variant={ButtonVariant.plain}
            />
          ) : (
            <Split>
              <SplitItem>
                <Button
                  aria-label={t('Edit')}
                  icon={<PencilAltIcon />}
                  isDisabled={isDisabled}
                  onClick={() => {
                    setEditKey(label.key);
                    setIsEditing(true);
                  }}
                  variant={ButtonVariant.plain}
                />
              </SplitItem>
              <SplitItem>
                <Button
                  aria-label={t('Delete')}
                  icon={<TrashIcon />}
                  isDisabled={isDisabled}
                  onClick={onDelete}
                  variant={ButtonVariant.plain}
                />
              </SplitItem>
            </Split>
          )}
        </SplitItem>
      </Split>
      {keyError && (
        <HelperText>
          <HelperTextItem variant="error">{keyError}</HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

export default AutoAppliedLabelKeyCell;
