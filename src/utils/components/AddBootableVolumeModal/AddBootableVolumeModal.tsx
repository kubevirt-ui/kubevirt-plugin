import React, { FC, useCallback, useMemo, useState } from 'react';

import useClusterPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useClusterPreferences';
import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/components/DiskModal/DiskFormFields/hooks/useStorageProfileClaimPropertySets';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Form, PopoverPosition, Title } from '@patternfly/react-core';

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
  enforceNamespace?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreateVolume?: (
    source: BootableVolume,
    pvcSource?: IoK8sApiCoreV1PersistentVolumeClaim,
  ) => void;
};

const AddBootableVolumeModal: FC<AddBootableVolumeModalProps> = ({
  enforceNamespace,
  isOpen,
  onClose,
  onCreateVolume,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const selectedNamespace =
    activeNamespace === ALL_NAMESPACES_SESSION_KEY ? undefined : activeNamespace;
  const namespace = enforceNamespace ?? selectedNamespace ?? DEFAULT_NAMESPACE;

  const [bootableVolume, setBootableVolume] = useState<AddBootableVolumeState>(
    initialBootableVolumeState,
  );
  const [sourceType, setSourceType] = useState<DROPDOWN_FORM_SELECTION>(
    DROPDOWN_FORM_SELECTION.UPLOAD_IMAGE,
  );
  const applyStorageProfileState = useState<boolean>(true);

  const [preferences] = useClusterPreferences();
  const preferencesNames = useMemo(() => preferences.map(getName), [preferences]);

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
        namespace,
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
      {t('Upload a new volume, or use an existing PersistentVolumeClaim (PVC) or DataSource.')}
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
          namespace={namespace}
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
          preferencesNames={preferencesNames}
          setBootableVolumeField={setBootableVolumeField}
        />
      </Form>
    </TabModal>
  );
};

export default AddBootableVolumeModal;
