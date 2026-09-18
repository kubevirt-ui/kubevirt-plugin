import { type FC, type FocusEvent, memo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { GridItem, HelperText, HelperTextItem, TextInput } from '@patternfly/react-core';

import RemoveAnnotation from './components/RemoveAnnotation';
import { getAnnotationKeyRequiredMessage } from './utils';

export const AnnotationsModalRow: FC<{
  annotation: { key: string; value: string };
  id: string;
  isProtected?: boolean;
  onChange: ({ key, value }: { key: string; value: string }) => void;
  onDelete: () => void;
}> = memo(({ annotation, id, isProtected, onChange, onDelete }) => {
  const { t } = useKubevirtTranslation();
  const [keyTouched, setKeyTouched] = useState(false);
  const showKeyError = keyTouched && !annotation.key.trim();
  const errorId = `annotation-${id}-error`;

  const handleKeyBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof HTMLElement && relatedTarget.dataset.test === 'cancel-button') {
      return;
    }

    setKeyTouched(true);
  };

  return (
    <>
      <GridItem span={5}>
        <TextInput
          aria-describedby={showKeyError ? errorId : undefined}
          aria-label={t('annotation key')}
          autoFocus={!isProtected}
          className="annotation-form-input"
          id={`annotation-${id}-key-input`}
          isDisabled={Boolean(isProtected)}
          isRequired
          maxLength={255}
          onBlur={handleKeyBlur}
          onChange={(_event, newKey) => {
            setKeyTouched(true);
            onChange({ ...annotation, key: newKey });
          }}
          placeholder={t('annotation key')}
          size={1}
          type="text"
          validated={showKeyError ? 'error' : 'default'}
          value={annotation.key}
        />
      </GridItem>
      <GridItem span={5}>
        <TextInput
          aria-label={t('annotation value')}
          className="annotation-form-input"
          isDisabled={Boolean(isProtected)}
          isRequired
          maxLength={255}
          onChange={(_event, newValue) => onChange({ ...annotation, value: newValue })}
          placeholder={t('annotation value')}
          type="text"
          value={annotation.value}
        />
      </GridItem>
      <GridItem span={2}>
        <RemoveAnnotation
          annotationKey={annotation.key}
          isProtected={Boolean(isProtected)}
          onDelete={onDelete}
        />
      </GridItem>
      {showKeyError && (
        <GridItem span={12}>
          <HelperText data-test={errorId} id={errorId}>
            <HelperTextItem variant="error">{getAnnotationKeyRequiredMessage(t)}</HelperTextItem>
          </HelperText>
        </GridItem>
      )}
    </>
  );
});
AnnotationsModalRow.displayName = 'AnnotationModalRow';
