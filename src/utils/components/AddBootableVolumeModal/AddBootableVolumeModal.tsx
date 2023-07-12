import React, { FC, useCallback, useMemo, useState } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-utils/models';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Form, PopoverPosition, Title } from '@patternfly/react-core';

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
  onCreateVolume?: (source: BootableVolume) => void;
};

const AddBootableVolumeModal: FC<AddBootableVolumeModalProps> = ({
  enforceNamespace,
  isOpen,
  onClose,
  onCreateVolume,
}) => {
  const [activeNamespace] = useActiveNamespace();
  const selectedNamespace =
    activeNamespace === ALL_NAMESPACES_SESSION_KEY ? undefined : activeNamespace;

  const namespace = enforceNamespace ?? selectedNamespace ?? DEFAULT_NAMESPACE;

  const { t } = useKubevirtTranslation();

  const [preferences] = useK8sWatchResource<V1beta1VirtualMachineClusterPreference[]>({
    groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
    isList: true,
  });

  const preferencesNames = useMemo(() => preferences.map(getName), [preferences]);
  const [sourceType, setSourceType] = useState<DROPDOWN_FORM_SELECTION>(
    DROPDOWN_FORM_SELECTION.UPLOAD_IMAGE,
  );
  const { upload, uploadData } = useCDIUpload();

  const [bootableVolume, setBootableVolume] = useState<AddBootableVolumeState>(
    initialBootableVolumeState,
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
          upload.cancelUpload().catch(console.error);
        }
        onClose();
      }}
      onSubmit={createBootableVolume({
        bootableVolume,
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
        {sourceType !== DROPDOWN_FORM_SELECTION.USE_REGISTRY && (
          <>
            <Title className="pf-u-mt-md" headingLevel="h5">
              {t('Destination details')}
            </Title>
            <VolumeDestination
              bootableVolume={bootableVolume}
              namespace={namespace}
              setBootableVolumeField={setBootableVolumeField}
            />
          </>
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
