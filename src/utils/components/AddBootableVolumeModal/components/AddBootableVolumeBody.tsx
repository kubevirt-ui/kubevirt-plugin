import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';

import {
  DROPDOWN_FORM_SELECTION,
  initialBootableVolumeState,
  SOURCE_DETAILS_SECTION_ID,
} from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import {
  deleteBootableVolumeLabel,
  updateBootableVolumeField,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Form, PopoverPosition, Title } from '@patternfly/react-core';

import SourceTypeSelection from './SourceTypeSelection/SourceTypeSelection';
import VolumeDestination from './VolumeDestination/VolumeDestination';
import ClusterSelect from './VolumeMetadata/components/ClusterSelect';
import VolumeMetadata from './VolumeMetadata/VolumeMetadata';
import VolumeSource from './VolumeSource/VolumeSource';
import SchedulingSettings from './SchedulingSettings';

type AddBootableVolumeBodyProps = {
  bootableVolume: AddBootableVolumeState;
  isUploading?: boolean;
  setBootableVolume: Dispatch<SetStateAction<AddBootableVolumeState>>;
  setSourceType: Dispatch<SetStateAction<DROPDOWN_FORM_SELECTION>>;
  sourceType: DROPDOWN_FORM_SELECTION;
  upload: DataUpload;
};

const AddBootableVolumeBody: FC<AddBootableVolumeBodyProps> = ({
  bootableVolume,
  isUploading,
  setBootableVolume,
  setSourceType,
  sourceType,
  upload,
}) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const [activeNamespace] = useActiveNamespace();
  const namespace = getValidNamespace(activeNamespace);

  const setBootableVolumeField: SetBootableVolumeFieldType = useCallback(
    (key, fieldKey) => (value) =>
      setBootableVolume((prevState) => updateBootableVolumeField(prevState, key, value, fieldKey)),
    [setBootableVolume],
  );

  const deleteLabel = useCallback(
    (labelKey: string) => setBootableVolume((prev) => deleteBootableVolumeLabel(prev, labelKey)),
    [setBootableVolume],
  );

  const resetDiskSize = () => setBootableVolumeField('size')(initialBootableVolumeState.size);

  return (
    <Form className="pf-v6-u-mt-md">
      {isACMPage && (
        <ClusterSelect
          bootableVolume={bootableVolume}
          isDisabled={isUploading}
          setBootableVolumeField={setBootableVolumeField}
        />
      )}
      <SourceTypeSelection
        formSelection={sourceType}
        isDisabled={isUploading}
        namespace={namespace}
        resetDiskSize={resetDiskSize}
        setFormSelection={setSourceType}
      />
      <Title headingLevel="h5" id={SOURCE_DETAILS_SECTION_ID}>
        {t('Source details')}
      </Title>
      <VolumeSource
        bootableVolume={bootableVolume}
        setBootableVolumeField={setBootableVolumeField}
        sourceType={sourceType}
        upload={upload}
      />
      {sourceType === DROPDOWN_FORM_SELECTION.USE_REGISTRY && (
        <SchedulingSettings
          bootableVolume={bootableVolume}
          isDisabled={isUploading}
          setBootableVolumeField={setBootableVolumeField}
        />
      )}
      <Title headingLevel="h5">{t('Destination details')}</Title>
      <VolumeDestination
        bootableVolume={bootableVolume}
        isDisabled={isUploading}
        isSnapshotSourceType={sourceType === DROPDOWN_FORM_SELECTION.USE_SNAPSHOT}
        setBootableVolumeField={setBootableVolumeField}
      />
      <Title headingLevel="h5">
        {t('Volume metadata')}{' '}
        <HelpTextIcon
          bodyContent={(hide) => (
            <PopoverContentWithLightspeedButton
              content={t('Set the volume metadata to use the volume as a bootable image.')}
              hide={hide}
              promptType={OLSPromptType.BOOTABLE_VOLUME_METADATA}
            />
          )}
          helpIconClassName="pf-v6-u-ml-xs"
          position={PopoverPosition.right}
        />
      </Title>
      <VolumeMetadata
        bootableVolume={bootableVolume}
        deleteLabel={deleteLabel}
        isDisabled={isUploading}
        setBootableVolumeField={setBootableVolumeField}
      />
    </Form>
  );
};

export default AddBootableVolumeBody;
