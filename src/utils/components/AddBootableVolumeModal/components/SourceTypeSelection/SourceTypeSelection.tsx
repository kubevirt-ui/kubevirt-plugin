import React, { FC, useCallback, useEffect, useState } from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePermissions from '@kubevirt-utils/hooks/usePermissions/usePermissions';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { Divider, FormGroup, SelectGroup } from '@patternfly/react-core';
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
          : DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME,
      );
    }
  }, [canUploadImage, permissionsLoading, loading, setFormSelection]);

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  return (
    <FormGroup fieldId="source-type" label={t('Source type')}>
      <Select
        toggle={SelectToggle({
          'data-test-id': 'source-type-select',
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
        <SelectGroup label={t('Upload new')}>
          <SelectOption
            isDisabled={!canUploadImage}
            value={DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME}
            {...(!canUploadImage && {
              description: t("You don't have permission to perform this action"),
            })}
            data-test-id="upload-volume"
          >
            {optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME]}
          </SelectOption>
        </SelectGroup>
        <Divider />
        <SelectGroup label={t('Use existing')}>
          <SelectOption
            data-test-id="use-existing-volume"
            description={t('Use volume already available on the cluster')}
            isDisabled={!canCreatePVC}
            value={DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC}
          >
            {optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]}
          </SelectOption>
          <SelectOption
            data-test-id="use-snapshot"
            isDisabled={!canCreateSnapshots}
            value={DROPDOWN_FORM_SELECTION.USE_SNAPSHOT}
          >
            {optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]}
          </SelectOption>
        </SelectGroup>
        <Divider />
        <SelectGroup label={t('Import from')}>
          <SelectOption
            data-test-id="use-registry"
            description={t('Content from container registry')}
            isDisabled={!canCreateDS}
            value={DROPDOWN_FORM_SELECTION.USE_REGISTRY}
          >
            {optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.USE_REGISTRY]}
          </SelectOption>
        </SelectGroup>
      </Select>
    </FormGroup>
  );
};

export default SourceTypeSelection;
