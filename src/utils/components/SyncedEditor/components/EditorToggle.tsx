import React, { FC, FormEvent } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, Radio } from '@patternfly/react-core';

import { EditorType } from '../utils/types';

import '../SyncedEditor.scss';

type EditorToggleProps = {
  onChange: (newValue: EditorType) => void;
  value: EditorType;
};

export const EditorToggle: FC<EditorToggleProps> = ({ onChange, value }) => {
  const { t } = useKubevirtTranslation();

  const handleChange = (event: FormEvent<HTMLInputElement>) => {
    onChange(event?.currentTarget?.value as EditorType);
  };

  return (
    <div className="co-synced-editor__editor-toggle">
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        aria-labelledby="radio-group-title-editor-toggle"
        role="radiogroup"
        spaceItems={{ default: 'spaceItemsMd' }}
      >
        <label
          className="co-synced-editor__editor-toggle-label"
          id="radio-group-title-editor-toggle"
        >
          {t('Configure via:')}
        </label>
        <Radio
          data-test={`${EditorType.Form}-view-input`}
          id={EditorType.Form}
          isChecked={value === EditorType.Form}
          label={t('Form view')}
          name={EditorType.Form}
          onChange={handleChange}
          value={EditorType.Form}
        />
        <Radio
          data-test={`${EditorType.YAML}-view-input`}
          id={EditorType.YAML}
          isChecked={value === EditorType.YAML}
          label={t('YAML view')}
          name={EditorType.YAML}
          onChange={handleChange}
          value={EditorType.YAML}
        />
      </Flex>
    </div>
  );
};
