import React, { FC, useCallback, useMemo, useState } from 'react';

import LabelKeyInput from '@kubevirt-utils/components/LabelsModal/components/LabelKeyInput';
import { AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateLabelEntry } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { CheckIcon, TrashIcon } from '@patternfly/react-icons';

type AddKeyRowProps = {
  existingKeys: string[];
  isDisabled: boolean;
  onAdd: (label: AutoAppliedLabel) => void;
  onCancel: () => void;
};

const AddKeyRow: FC<AddKeyRowProps> = ({ existingKeys, isDisabled, onAdd, onCancel }) => {
  const { t } = useKubevirtTranslation();
  const [key, setKey] = useState('');

  const keyError = useMemo(
    () => validateLabelEntry(key, '', t, undefined, [...existingKeys, key]),
    [existingKeys, key, t],
  );
  const canConfirm = Boolean(key.trim()) && !keyError && !isDisabled;

  const onConfirm = useCallback((): void => {
    if (!canConfirm) {
      return;
    }
    onAdd({ key, required: false, value: '' });
  }, [canConfirm, key, onAdd]);

  return (
    <Grid hasGutter>
      <GridItem span={5}>
        <Split hasGutter>
          <SplitItem isFilled>
            <LabelKeyInput existingKeys={existingKeys} onChange={setKey} value={key} />
          </SplitItem>
          <SplitItem>
            <Flex flexWrap={{ default: 'nowrap' }} spaceItems={{ default: 'spaceItemsNone' }}>
              <FlexItem>
                <Button
                  aria-label={t('Confirm')}
                  icon={<CheckIcon />}
                  isDisabled={!canConfirm}
                  onClick={onConfirm}
                  variant={ButtonVariant.plain}
                />
              </FlexItem>
              <FlexItem>
                <Button
                  aria-label={t('Cancel')}
                  icon={<TrashIcon />}
                  isDisabled={isDisabled}
                  onClick={onCancel}
                  variant={ButtonVariant.plain}
                />
              </FlexItem>
            </Flex>
          </SplitItem>
        </Split>
        {keyError && (
          <HelperText>
            <HelperTextItem variant="error">{keyError}</HelperTextItem>
          </HelperText>
        )}
      </GridItem>
    </Grid>
  );
};

export default AddKeyRow;
