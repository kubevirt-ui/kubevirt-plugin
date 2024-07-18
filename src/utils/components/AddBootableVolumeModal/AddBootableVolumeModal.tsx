import React, { FC, useCallback, useState } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getValidNamespace, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Form, PopoverPosition, Title } from '@patternfly/react-core';

import { VolumeSnapshotKind } from '../SelectSnapshot/types';

import SchedulingSettings from './components/SchedulingSettings';
import SourceTypeSelection from './components/SourceTypeSelection/SourceTypeSelection';
import VolumeDestination from './components/VolumeDestination/VolumeDestination';
import VolumeMetadata from './components/VolumeMetadata/VolumeMetadata';
import VolumeSource from './components/VolumeSource/VolumeSource';
import {
  AddBootableVolumeState,
  DROPDOWN_FORM_SELECTION,
  emptyDataSource,
  initialBootableVolumeState,
  SetBootableVolumeFieldType,
} from './utils/constants';
import { createBootableVolume } from './utils/utils';

import './AddBootableVolumeModal.scss';

type AddBootableVolumeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateVolume?: (
    source: BootableVolume,
    pvcSource?: IoK8sApiCoreV1PersistentVolumeClaim,
    volumeSnapshotSource?: VolumeSnapshotKind,
  ) => void;
};

const AddBootableVolumeModal: FC<AddBootableVolumeModalProps> = ({
  isOpen,
  onClose,
  onCreateVolume,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const namespace = getValidNamespace(activeNamespace);

  const [bootableVolume, setBootableVolume] = useState<AddBootableVolumeState>({
    ...initialBootableVolumeState,
    bootableVolumeNamespace: namespace,
  });

  const [sourceType, setSourceType] = useState<DROPDOWN_FORM_SELECTION>(
    DROPDOWN_FORM_SELECTION.UPLOAD_IMAGE,
  );

  const applyStorageProfileState = useState<boolean>(true);

  const { upload, uploadData } = useCDIUpload();

  const claimPropertySetsData = useStorageProfileClaimPropertySets(
    bootableVolume?.storageClassName,
  );

  const { labels } = bootableVolume || {};

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

  const deleteLabel = (labelKey: string) => {
    setBootableVolume((prev) => {
      const updatedLabels = { ...prev?.labels };
      delete updatedLabels[labelKey];

      return { ...prev, labels: updatedLabels };
    });
  };
  return (
    <TabModal
      onClose={() => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          upload.cancelUpload().catch(kubevirtConsole.error);
        }
        onClose();
      }}
      onSubmit={createBootableVolume({
        applyStorageProfileSettings: applyStorageProfileState[0],
        bootableVolume,
        claimPropertySets: claimPropertySetsData?.claimPropertySets,
        onCreateVolume,
        sourceType,
        uploadData,
      })}
      headerText={t('Add volume')}
      isDisabled={!labels?.[DEFAULT_PREFERENCE_LABEL]}
      isOpen={isOpen}
      obj={emptyDataSource}
      submitBtnText={t('Save')}
    >
      {t(
        'Upload a new volume, or use an existing PersistentVolumeClaim (PVC), VolumeSnapshot or DataSource.',
      )}
      <Form className="pf-u-mt-md">
        <SourceTypeSelection
          formSelection={sourceType}
          namespace={namespace}
          setFormSelection={setSourceType}
        />
        <Title headingLevel="h5">{t('Source details')}</Title>
        <VolumeSource
          bootableVolume={bootableVolume}
          setBootableVolumeField={setBootableVolumeField}
          sourceType={sourceType}
          upload={upload}
        />
        <Title className="pf-u-mt-md" headingLevel="h5">
          {t('Destination details')}
        </Title>
        <VolumeDestination
          applyStorageProfileState={applyStorageProfileState}
          bootableVolume={bootableVolume}
          claimPropertySetsData={claimPropertySetsData}
          setBootableVolumeField={setBootableVolumeField}
        />

        {sourceType === DROPDOWN_FORM_SELECTION.USE_REGISTRY && (
          <SchedulingSettings
            bootableVolume={bootableVolume}
            setBootableVolumeField={setBootableVolumeField}
          />
        )}
        <Title className="pf-u-mt-md" headingLevel="h5">
          {t('Volume metadata')}{' '}
          <HelpTextIcon
            bodyContent={t('Set the volume metadata to use the volume as a bootable image.')}
            helpIconClassName="add-bootable-volume-modal__title-help-text-icon"
            position={PopoverPosition.right}
          />
        </Title>
        <VolumeMetadata
          bootableVolume={bootableVolume}
          deleteLabel={deleteLabel}
          setBootableVolumeField={setBootableVolumeField}
        />
      </Form>
    </TabModal>
  );
};

export default AddBootableVolumeModal;
