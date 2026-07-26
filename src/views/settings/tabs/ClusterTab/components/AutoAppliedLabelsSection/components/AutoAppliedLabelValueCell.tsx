import React, { FC, useCallback, useState } from 'react';

import { AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateK8sLabelValue } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import {
  Button,
  ButtonVariant,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
  TextInput,
} from '@patternfly/react-core';
import { CheckIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';

import '@settings/tabs/components/settings-label-cell.scss';

type AutoAppliedLabelValueCellProps = {
  isDisabled: boolean;
  label: AutoAppliedLabel;
  onUpdate: (label: AutoAppliedLabel) => void;
};

const AutoAppliedLabelValueCell: FC<AutoAppliedLabelValueCellProps> = ({
  isDisabled,
  label,
  onUpdate,
}) => {
  const { t } = useKubevirtTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label.value);

  const valueError = isEditing ? validateK8sLabelValue(editValue, t) : undefined;
  const canSave = !valueError && !isDisabled;

  const onSave = useCallback((): void => {
    if (!canSave) return;
    onUpdate({ ...label, value: editValue });
    setIsEditing(false);
  }, [canSave, editValue, label, onUpdate]);

  const onClear = useCallback((): void => {
    onUpdate({ ...label, value: '' });
  }, [label, onUpdate]);

  if (isEditing) {
    return (
      <>
        <Split className="settings-label-cell__row" hasGutter>
          <SplitItem isFilled>
            <TextInput
              aria-label={t('Value for {{key}}', { key: label.key })}
              isDisabled={isDisabled}
              onChange={(_event, value) => setEditValue(value)}
              placeholder={t('Enter a value')}
              validated={valueError ? 'error' : 'default'}
              value={editValue}
            />
          </SplitItem>
          <SplitItem>
            <Button
              aria-label={t('Confirm')}
              icon={<CheckIcon />}
              isDisabled={!canSave}
              onClick={onSave}
              variant={ButtonVariant.plain}
            />
          </SplitItem>
        </Split>
        {valueError && (
          <HelperText>
            <HelperTextItem variant="error">{valueError}</HelperTextItem>
          </HelperText>
        )}
      </>
    );
  }

  return (
    <Split className="settings-label-cell__row" hasGutter>
      <SplitItem isFilled>{label.value || t('No value set')}</SplitItem>
      <SplitItem>
        <Split>
          <SplitItem>
            <Button
              aria-label={t('Edit value')}
              icon={<PencilAltIcon />}
              isDisabled={isDisabled}
              onClick={() => {
                setEditValue(label.value);
                setIsEditing(true);
              }}
              variant={ButtonVariant.plain}
            />
          </SplitItem>
          <SplitItem>
            <Button
              aria-label={t('Clear value')}
              icon={<TrashIcon />}
              isDisabled={isDisabled || !label.value}
              onClick={onClear}
              variant={ButtonVariant.plain}
            />
          </SplitItem>
        </Split>
      </SplitItem>
    </Split>
  );
};

export default AutoAppliedLabelValueCell;
