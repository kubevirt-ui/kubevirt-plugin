import { type FC, type ReactElement, useCallback, useEffect, useState } from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useBootableVolumeSourcePermissions from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumeSourcePermissions';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { Divider, FormGroup, Select, SelectGroup, SelectOption } from '@patternfly/react-core';

import { DROPDOWN_FORM_SELECTION, optionsValueLabelMapper } from '../../consts';

type SourceTypeSelectionProps = {
  formSelection: DROPDOWN_FORM_SELECTION;
  isDisabled?: boolean;
  namespace: string;
  resetDiskSize: () => void;
  setFormSelection: (value: DROPDOWN_FORM_SELECTION) => void;
};

const SourceTypeSelection: FC<SourceTypeSelectionProps> = ({
  formSelection,
  isDisabled,
  namespace,
  resetDiskSize,
  setFormSelection,
}): ReactElement => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { canCreateDS, canCreatePVC, canCreateSnapshots, canUploadImage, defaultSource, loading } =
    useBootableVolumeSourcePermissions(namespace);

  const onSelect = useCallback(
    (_event, value): void => {
      _event?.preventDefault();
      setFormSelection(value as DROPDOWN_FORM_SELECTION);
      setIsOpen(false);

      if (
        formSelection === DROPDOWN_FORM_SELECTION.USE_SNAPSHOT &&
        value !== DROPDOWN_FORM_SELECTION.USE_SNAPSHOT
      ) {
        resetDiskSize();
      }
    },
    [formSelection, setFormSelection, resetDiskSize],
  );

  useEffect(() => {
    if (!loading) {
      setFormSelection(defaultSource);
    }
  }, [defaultSource, loading, setFormSelection]);

  const onToggle = (): void => setIsOpen((prevIsOpen) => !prevIsOpen);

  return (
    <FormGroup fieldId="source-type" label={t('Source type')}>
      <Select
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={onSelect}
        selected={formSelection}
        toggle={SelectToggle({
          'data-test': 'source-type-select',
          isDisabled,
          isExpanded: isOpen,
          isFullWidth: true,
          onClick: isDisabled ? undefined : onToggle,
          selected: t(optionsValueLabelMapper[formSelection]),
        })}
      >
        <SelectGroup label={t('Upload new')}>
          <SelectOption
            isDisabled={!canUploadImage}
            value={DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME}
            {...(!canUploadImage && {
              description: getNoPermissionTooltipContent(t),
            })}
          >
            {t(optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME])}
          </SelectOption>
        </SelectGroup>
        <Divider />
        <SelectGroup label={t('Use existing')}>
          <SelectOption
            data-test="use-existing-volume"
            description={t('Use volume already available on the cluster')}
            isDisabled={!canCreatePVC}
            value={DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC}
          >
            {t(optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC])}
          </SelectOption>
          <SelectOption
            isDisabled={!canCreateSnapshots}
            value={DROPDOWN_FORM_SELECTION.USE_SNAPSHOT}
          >
            {t(optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.USE_SNAPSHOT])}
          </SelectOption>
        </SelectGroup>
        <Divider />
        <SelectGroup label={t('Import from')}>
          <SelectOption
            data-test="use-registry"
            description={t('Content from container registry')}
            isDisabled={!canCreateDS}
            value={DROPDOWN_FORM_SELECTION.USE_REGISTRY}
          >
            {t(optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.USE_REGISTRY])}
          </SelectOption>
          <SelectOption
            data-test="use-http"
            description={t('Import content via URL (HTTP or HTTPS endpoint).')}
            isDisabled={!canCreateDS}
            value={DROPDOWN_FORM_SELECTION.USE_HTTP}
          >
            {t(optionsValueLabelMapper[DROPDOWN_FORM_SELECTION.USE_HTTP])}
          </SelectOption>
        </SelectGroup>
      </Select>
    </FormGroup>
  );
};

export default SourceTypeSelection;
