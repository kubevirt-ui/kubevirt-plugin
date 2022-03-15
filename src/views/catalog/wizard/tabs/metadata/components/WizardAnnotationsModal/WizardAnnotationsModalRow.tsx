import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

export const WizardAnnotationsModalRow: React.FC<{
  annotation: { key: string; value: string };
  onChange: ({ key, value }: { key: string; value: string }) => void;
  onDelete: () => void;
}> = React.memo(({ annotation, onChange, onDelete }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <GridItem span={5}>
        <TextInput
          maxLength={255}
          className="annotation-form-input"
          size={1}
          placeholder={t('annotation key')}
          isRequired
          type="text"
          value={annotation.key}
          onChange={(newKey) => onChange({ ...annotation, key: newKey })}
          aria-label={t('annotation key')}
        />
      </GridItem>
      <GridItem span={5}>
        <TextInput
          maxLength={255}
          className="annotation-form-input"
          placeholder={t('annotation value')}
          isRequired
          type="text"
          value={annotation.value}
          onChange={(newValue) => onChange({ ...annotation, value: newValue })}
          aria-label={t('annotation value')}
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
WizardAnnotationsModalRow.displayName = 'AnnotationModalRow';
