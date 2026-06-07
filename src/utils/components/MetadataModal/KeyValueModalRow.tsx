import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

type KeyValueModalRowProps = {
  entry: { key: string; value: string };
  existingKeys?: string[];
  keyRenderer?: (props: {
    existingKeys: string[];
    onSelect: (key: string) => void;
    selectedKey: string;
  }) => ReactNode;
  onChange: ({ key, value }: { key: string; value: string }) => void;
  onDelete: () => void;
};

export const KeyValueModalRow: FC<KeyValueModalRowProps> = ({
  entry,
  existingKeys,
  keyRenderer,
  onChange,
  onDelete,
}) => {
  const { t } = useKubevirtTranslation();
  const valuePlaceholder = t('Value');
  const keyPlaceholder = t('Key');

  return (
    <>
      <GridItem span={5}>
        {keyRenderer ? (
          keyRenderer({
            existingKeys: existingKeys || [],
            onSelect: (key) => onChange({ ...entry, key }),
            selectedKey: entry.key,
          })
        ) : (
          <TextInput
            aria-label={keyPlaceholder}
            autoFocus
            className="key-value-form-input"
            isRequired
            maxLength={255}
            onChange={(_event, newKey) => onChange({ ...entry, key: newKey })}
            placeholder={keyPlaceholder}
            size={1}
            type="text"
            value={entry.key}
          />
        )}
      </GridItem>
      <GridItem span={5}>
        <TextInput
          aria-label={valuePlaceholder}
          className="key-value-form-input"
          isRequired
          maxLength={keyRenderer ? 63 : 255}
          onChange={(_event, newValue) => onChange({ ...entry, value: newValue })}
          placeholder={valuePlaceholder}
          type="text"
          value={entry.value}
        />
      </GridItem>
      <GridItem span={2}>
        <Button
          aria-label={t('Remove')}
          icon={<MinusCircleIcon />}
          onClick={() => onDelete()}
          variant={ButtonVariant.plain}
        />
      </GridItem>
    </>
  );
};
