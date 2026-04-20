import React, { Dispatch, FCC, SetStateAction, useCallback } from 'react';

import {
  AddBootableVolumeState,
  DROPDOWN_FORM_SELECTION,
  initialBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
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
  setBootableVolume: Dispatch<SetStateAction<AddBootableVolumeState>>;
  setSourceType: Dispatch<SetStateAction<DROPDOWN_FORM_SELECTION>>;
  sourceType: DROPDOWN_FORM_SELECTION;
  upload: DataUpload;
};

const AddBootableVolumeBody: FCC<AddBootableVolumeBodyProps> = ({
  bootableVolume,
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
      setBootableVolume((prevState) => ({
        ...prevState,
        ...(fieldKey
          ? { [key]: { ...(prevState[key] as object), [fieldKey]: value } }
          : { ...prevState, [key]: value }),
      })),
    [],
  );

  const deleteLabel = useCallback((labelKey: string) => {
    setBootableVolume((prev) => {
      const updatedLabels = { ...prev?.labels };
      delete updatedLabels[labelKey];

      return { ...prev, labels: updatedLabels };
    });
  }, []);

  const resetDiskSize = () => setBootableVolumeField('size')(initialBootableVolumeState.size);

  return (
    <Form className="pf-v6-u-mt-md">
      {isACMPage && (
        <ClusterSelect
          bootableVolume={bootableVolume}
          setBootableVolumeField={setBootableVolumeField}
        />
      )}
      <SourceTypeSelection
        formSelection={sourceType}
        namespace={namespace}
        resetDiskSize={resetDiskSize}
        setFormSelection={setSourceType}
      />
      <Title headingLevel="h5" id="source-details-section">
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
          setBootableVolumeField={setBootableVolumeField}
        />
      )}
      <Title className="pf-v6-u-mt-md" headingLevel="h5">
        {t('Destination details')}
      </Title>
      <VolumeDestination
        bootableVolume={bootableVolume}
        isSnapshotSourceType={sourceType === DROPDOWN_FORM_SELECTION.USE_SNAPSHOT}
        setBootableVolumeField={setBootableVolumeField}
      />
      <Title className="pf-v6-u-mt-md" headingLevel="h5">
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
        setBootableVolumeField={setBootableVolumeField}
      />
    </Form>
  );
};

export default AddBootableVolumeBody;
