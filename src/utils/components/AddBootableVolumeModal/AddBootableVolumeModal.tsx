import React, { FC, useCallback, useMemo, useState } from 'react';

import { InstanceTypeVMStoreActions } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { getValidNamespace, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Form, PopoverPosition, Title } from '@patternfly/react-core';

import SchedulingSettings from './components/SchedulingSettings';
import SourceTypeSelection from './components/SourceTypeSelection/SourceTypeSelection';
import VolumeDestination from './components/VolumeDestination/VolumeDestination';
import ClusterSelect from './components/VolumeMetadata/components/ClusterSelect';
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

type AddBootableVolumeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateVolume?: InstanceTypeVMStoreActions['onSelectCreatedVolume'];
};

const AddBootableVolumeModal: FC<AddBootableVolumeModalProps> = ({
  isOpen,
  onClose,
  onCreateVolume,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const namespace = getValidNamespace(activeNamespace);
  const isACMPage = useIsACMPage();
  const selectedCluster = useSelectedCluster();

  const [bootableVolume, setBootableVolume] = useState<AddBootableVolumeState>({
    ...initialBootableVolumeState,
    bootableVolumeCluster: selectedCluster,
    bootableVolumeNamespace: namespace,
  });

  const [sourceType, setSourceType] = useState<DROPDOWN_FORM_SELECTION>(
    DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME,
  );

  const { upload, uploadData } = useCDIUpload(bootableVolume?.bootableVolumeCluster);

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

  const isRegistryFormValid = useMemo(() => {
    if (sourceType !== DROPDOWN_FORM_SELECTION.USE_REGISTRY) return true;

    const { registryCredentials, registryURL } = bootableVolume;
    const { password, username } = registryCredentials || {};

    const credentialsValid = (username && password) || (!username && !password);

    return !!(registryURL && credentialsValid);
  }, [sourceType, bootableVolume]);

  const isFormValid = useMemo(() => {
    const hasRequiredPreference = !!labels?.[DEFAULT_PREFERENCE_LABEL];
    return hasRequiredPreference && isRegistryFormValid;
  }, [labels, isRegistryFormValid]);

  const deleteLabel = useCallback((labelKey: string) => {
    setBootableVolume((prev) => {
      const updatedLabels = { ...prev?.labels };
      delete updatedLabels[labelKey];

      return { ...prev, labels: updatedLabels };
    });
  }, []);

  const resetDiskSize = () => setBootableVolumeField('size')(initialBootableVolumeState.size);

  return (
    <TabModal
      onClose={() => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          upload.cancelUpload().catch(kubevirtConsole.error);
        }
        onClose();
      }}
      onSubmit={(dataSource) => {
        if (sourceType === DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME) {
          document.getElementById('source-details-section').scrollIntoView();
        }

        return createBootableVolume({
          bootableVolume,
          onCreateVolume,
          sourceType,
          uploadData,
        })(dataSource);
      }}
      headerText={t('Add volume')}
      isDisabled={!isFormValid}
      isOpen={isOpen}
      obj={emptyDataSource}
      submitBtnText={t('Save')}
    >
      {t('Add a new bootable volume to the cluster.')}

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
            bodyContent={t('Set the volume metadata to use the volume as a bootable image.')}
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
    </TabModal>
  );
};

export default AddBootableVolumeModal;
