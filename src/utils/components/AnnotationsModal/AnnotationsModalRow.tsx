import React, { type FC, memo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

export const AnnotationsModalRow: FC<{
  annotation: { key: string; value: string };
  isProtected?: boolean;
  onChange: ({ key, value }: { key: string; value: string }) => void;
  onDelete: () => void;
}> = memo(({ annotation, isProtected, onChange, onDelete }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <GridItem span={5}>
        <TextInput
          aria-label={t('annotation key')}
          autoFocus={!isProtected}
          className="annotation-form-input"
          isDisabled={isProtected}
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
          isDisabled={isProtected}
          isRequired
          maxLength={255}
          onChange={(_event, newValue) => onChange({ ...annotation, value: newValue })}
          placeholder={t('annotation value')}
          type="text"
          value={annotation.value}
        />
      </GridItem>
      <GridItem span={2}>
        <Button
          aria-label={t('Remove annotation')}
          data-test={`delete-annotation-row-${annotation.key}`}
          icon={<MinusCircleIcon />}
          isDisabled={isProtected}
          onClick={() => onDelete()}
          variant={ButtonVariant.plain}
        />
      </GridItem>
    </>
  );
});
AnnotationsModalRow.displayName = 'AnnotationModalRow';
