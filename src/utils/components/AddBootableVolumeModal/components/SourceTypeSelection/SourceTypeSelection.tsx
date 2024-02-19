import React, { FC, useCallback, useEffect, useState } from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePermissions from '@kubevirt-utils/hooks/usePermissions/usePermissions';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { FormGroup } from '@patternfly/react-core';
import { Select, SelectOption } from '@patternfly/react-core';

import { DROPDOWN_FORM_SELECTION, optionsValueLabelMapper } from '../../utils/constants';

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
  const { capabilitiesData, isLoading: permissionsLoading } = usePermissions();
  const canUploadImage = capabilitiesData.uploadImage.allowed && canCreatePVC;

  const onSelect = useCallback(
    (event, value) => {
      event.preventDefault();
      setFormSelection(value);
      setIsOpen(false);
    },
    [setFormSelection],
  );

  useEffect(() => {
    if (!permissionsLoading && !loading) {
      setFormSelection(
        !canUploadImage
          ? DROPDOWN_FORM_SELECTION.USE_REGISTRY
          : DROPDOWN_FORM_SELECTION.UPLOAD_IMAGE,
      );
    }
  }, [canUploadImage, permissionsLoading, loading, setFormSelection]);

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  return (
    <FormGroup fieldId="source-type" label={t('Source type')}>
      <Select
        toggle={SelectToggle({
          isExpanded: isOpen,
          isFullWidth: true,
          onClick: onToggle,
          selected: optionsValueLabelMapper[formSelection],
        })}
        isOpen={isOpen}
        onOpenChange={(open: boolean) => setIsOpen(open)}
        onSelect={onSelect}
        selected={formSelection}
      >
        <SelectOption
          isDisabled={!canUploadImage}
          value={DROPDOWN_FORM_SELECTION.UPLOAD_IMAGE}
          {...(!canUploadImage && {
            description: t("You don't have permission to perform this action"),
          })}
        >
          {optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.UPLOAD_IMAGE]}
        </SelectOption>

        <SelectOption isDisabled={!canCreatePVC} value={DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC}>
          {optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]}
        </SelectOption>

        <SelectOption isDisabled={!canCreateSnapshots} value={DROPDOWN_FORM_SELECTION.USE_SNAPSHOT}>
          {optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]}
        </SelectOption>

        <SelectOption
          description={t(
            'Creates a DataImportCron, which defines a cron job to poll and import the disk image.',
          )}
          isDisabled={!canCreateDS}
          value={DROPDOWN_FORM_SELECTION.USE_REGISTRY}
        >
          {optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.USE_REGISTRY]}
        </SelectOption>
      </Select>
    </FormGroup>
  );
};

export default SourceTypeSelection;
