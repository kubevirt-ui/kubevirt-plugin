import React, { FC, useCallback, useEffect, useState } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { DROPDOWN_FORM_SELECTION } from '../../utils/constants';

type SourceTypeSelectionProps = {
  formSelection: DROPDOWN_FORM_SELECTION;
  namespace: string;
  setFormSelection: (value: DROPDOWN_FORM_SELECTION) => void;
};

const SourceTypeSelection: FC<SourceTypeSelectionProps> = ({
  formSelection,
  namespace,
  setFormSelection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { canCreateDS, canCreatePVC, canCreateSnapshots, loading } =
    useCanCreateBootableVolume(namespace);

  const onSelect = useCallback(
    (event, value) => {
      event.preventDefault();
      setFormSelection(value);
      setIsOpen(false);
    },
    [setFormSelection],
  );

  useEffect(() => {
    if (!loading && !canCreatePVC) {
      setFormSelection(DROPDOWN_FORM_SELECTION.USE_REGISTRY);
    }
  }, [canCreatePVC, loading, setFormSelection]);

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
        <SelectOption isDisabled={!canCreatePVC} value={DROPDOWN_FORM_SELECTION.UPLOAD_IMAGE}>
          {t('Upload volume')}
        </SelectOption>

        <SelectOption isDisabled={!canCreatePVC} value={DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC}>
          {t('Use existing volume')}
        </SelectOption>

        <SelectOption isDisabled={!canCreateSnapshots} value={DROPDOWN_FORM_SELECTION.USE_SNAPSHOT}>
          {t('Use existing volume snapshot')}
        </SelectOption>

        <SelectOption
          description={t(
            'Creates a DataImportCron, which defines a cron job to poll and import the disk image.',
          )}
          isDisabled={!canCreateDS}
          value={DROPDOWN_FORM_SELECTION.USE_REGISTRY}
        >
          {t('Download from registry')}
        </SelectOption>
      </Select>
    </FormGroup>
  );
};

export default SourceTypeSelection;
