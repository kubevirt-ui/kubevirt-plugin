import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { K8S_DNS_SUBDOMAIN_MAX, K8S_LABEL_SEGMENT_MAX } from './utils/constants';
import { KeyRendererProps } from './utils/types';

type KeyValueModalRowProps = {
  entry: { key: string; value: string };
  existingKeys?: string[];
  KeyRenderer?: FC<KeyRendererProps>;
  onChange: (entry: { key: string; value: string }) => void;
  onDelete: () => void;
};

export const KeyValueModalRow: FC<KeyValueModalRowProps> = ({
  entry,
  existingKeys,
  KeyRenderer,
  onChange,
  onDelete,
}) => {
  const { t } = useKubevirtTranslation();
  const valueMaxLength = KeyRenderer ? K8S_LABEL_SEGMENT_MAX : undefined;

  return (
    <>
      <GridItem span={5}>
        {KeyRenderer ? (
          <KeyRenderer
            existingKeys={existingKeys || []}
            onSelect={(key) => onChange({ ...entry, key })}
            selectedKey={entry.key}
          />
        ) : (
          <TextInput
            aria-label={t('Key')}
            autoFocus
            className="key-value-form-input"
            isRequired
            maxLength={K8S_DNS_SUBDOMAIN_MAX}
            onChange={(_event, newKey) => onChange({ ...entry, key: newKey })}
            placeholder={t('Key')}
            size={1}
            type="text"
            value={entry.key}
          />
        )}
      </GridItem>
      <GridItem span={5}>
        <TextInput
          aria-label={t('Value')}
          className="key-value-form-input"
          isRequired
          maxLength={valueMaxLength}
          onChange={(_event, newValue) => onChange({ ...entry, value: newValue })}
          placeholder={t('Value')}
          type="text"
          value={entry.value}
        />
      </GridItem>
      <GridItem span={2}>
        <Button
          aria-label={t('Remove')}
          icon={<MinusCircleIcon />}
          onClick={onDelete}
          variant={ButtonVariant.plain}
        />
      </GridItem>
    </>
  );
};
