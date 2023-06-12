import React, { FC, useCallback, useState } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { DROPDOWN_FORM_SELECTION } from '../../utils/constants';

type SourceTypeSelectionProps = {
  formSelection: DROPDOWN_FORM_SELECTION;
  setFormSelection: (value: DROPDOWN_FORM_SELECTION) => void;
};

const SourceTypeSelection: FC<SourceTypeSelectionProps> = ({ formSelection, setFormSelection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = useCallback(
    (event, value) => {
      event.preventDefault();
      setFormSelection(value);
      setIsOpen(false);
    },
    [setFormSelection],
  );

  return (
    <FormGroup fieldId="source-type" label={t('Source type')}>
      <Select
        isOpen={isOpen}
        menuAppendTo="parent"
        onSelect={onSelect}
        onToggle={setIsOpen}
        selections={formSelection}
        variant={SelectVariant.single}
      >
        <SelectOption value={DROPDOWN_FORM_SELECTION.UPLOAD_IMAGE}>
          {t('Upload volume')}
        </SelectOption>

        <SelectOption value={DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC}>
          {t('Use existing volume')}
        </SelectOption>

        <SelectOption
          description={t(
            'A DataImportCron will also be created, which will define a cron job for recurring polling/importing or the disk image.',
          )}
          value={DROPDOWN_FORM_SELECTION.USE_REGISTRY}
        >
          {t('Download from registry')}
        </SelectOption>
      </Select>
    </FormGroup>
  );
};

export default SourceTypeSelection;
