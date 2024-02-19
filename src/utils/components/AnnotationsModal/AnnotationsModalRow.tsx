import React, { FC, memo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

export const AnnotationsModalRow: FC<{
  annotation: { key: string; value: string };
  onChange: ({ key, value }: { key: string; value: string }) => void;
  onDelete: () => void;
}> = memo(({ annotation, onChange, onDelete }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <GridItem span={5}>
        <TextInput
          aria-label={t('annotation key')}
          autoFocus
          className="annotation-form-input"
          isRequired
          maxLength={255}
          onChange={(_event, newKey) => onChange({ ...annotation, key: newKey })}
          placeholder={t('annotation key')}
          size={1}
          type="text"
          value={annotation.key}
        />
      </GridItem>
      <GridItem span={5}>
        <TextInput
          aria-label={t('annotation value')}
          className="annotation-form-input"
          isRequired
          maxLength={255}
          onChange={(_event, newValue) => onChange({ ...annotation, value: newValue })}
          placeholder={t('annotation value')}
          type="text"
          value={annotation.value}
        />
      </GridItem>
      <GridItem span={2}>
        <Button onClick={() => onDelete()} variant="plain">
          <MinusCircleIcon />
        </Button>
      </GridItem>
    </>
  );
});
AnnotationsModalRow.displayName = 'AnnotationModalRow';
