import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateLabelEntry } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import {
  Button,
  ButtonVariant,
  GridItem,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import LabelKeyInput from './LabelKeyInput';

type LabelRowProps = {
  existingKeys: string[];
  initialKeys?: Set<string>;
  isKeyProtected?: boolean;
  isValueProtected?: boolean;
  label: { key: string; value: string };
  onChange: (label: { key: string; value: string }) => void;
  onDelete: () => void;
};

const LabelRow: FC<LabelRowProps> = ({
  existingKeys,
  initialKeys,
  isKeyProtected,
  isValueProtected,
  label,
  onChange,
  onDelete,
}) => {
  const { t } = useKubevirtTranslation();

  const error = useMemo(
    () => validateLabelEntry(label.key, label.value, t, initialKeys, existingKeys),
    [label.key, label.value, t, initialKeys, existingKeys],
  );

  return (
    <>
      <GridItem span={5}>
        {isKeyProtected ? (
          <TextInput aria-label={t('Label key')} isDisabled value={label.key} />
        ) : (
          <LabelKeyInput
            existingKeys={existingKeys}
            onChange={(newKey) => onChange({ ...label, key: newKey })}
            value={label.key}
          />
        )}
      </GridItem>
      <GridItem span={5}>
        <TextInput
          aria-label={t('label value')}
          isDisabled={isValueProtected}
          onChange={(_event, newValue) => onChange({ ...label, value: newValue })}
          placeholder={t('Value')}
          type="text"
          validated={error ? 'error' : 'default'}
          value={label.value}
        />
      </GridItem>
      <GridItem span={2}>
        <Button
          aria-label={t('Remove label')}
          icon={<MinusCircleIcon />}
          isDisabled={isKeyProtected}
          onClick={onDelete}
          variant={ButtonVariant.plain}
        />
      </GridItem>
      {error && (
        <GridItem span={12}>
          <HelperText>
            <HelperTextItem variant="error">{error}</HelperTextItem>
          </HelperText>
        </GridItem>
      )}
    </>
  );
};

export default LabelRow;
