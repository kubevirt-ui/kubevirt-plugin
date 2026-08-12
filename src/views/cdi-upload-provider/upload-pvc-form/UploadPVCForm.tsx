import React, { type Dispatch, type FC, type SetStateAction } from 'react';

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1beta1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, FormGroup } from '@patternfly/react-core';

import UploadPVCFormFileInput from './UploadPVCFormFileInput';
import UploadPVCFormGoldenImage from './UploadPVCFormGoldenImage';
import UploadPVCFormPVCName from './UploadPVCFormPVCName';
import UploadPVCFormStorageSection from './UploadPVCFormStorageSection';
import { useUploadPVCFormLogic } from './useUploadPVCFormLogic';

import './upload-pvc-form.scss';

type UploadPVCFormProps = {
  commonTemplates: V1Template[];
  fileName: string;
  fileValue: File | string;
  goldenPvcs: V1beta1PersistentVolumeClaim[];
  handleFileChange: (_, value: File) => void;
  handleFileNameChange: (event, file: string) => void;
  isLoading: boolean;
  ns: string;
  onChange: (K8sResourceKind) => void;
  osParam?: string;
  setDisableFormSubmit: Dispatch<SetStateAction<boolean>>;
  setIsFileRejected: Dispatch<SetStateAction<boolean>>;
  storageClasses: IoK8sApiStorageV1StorageClass[];
};

const UploadPVCForm: FC<UploadPVCFormProps> = ({
  commonTemplates,
  fileName,
  fileValue,
  goldenPvcs,
  handleFileChange,
  handleFileNameChange,
  isLoading,
  ns,
  onChange,
  osParam,
  setDisableFormSubmit,
  setIsFileRejected,
  storageClasses,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    applySP,
    handleGoldenCheckbox,
    handleOs,
    handlePvcSizeTemplate,
    isGolden,
    loadError,
    mountAsCDROM,
    namespace,
    operatingSystemHaveDV,
    operatingSystems,
    osImageExists,
    pvcName,
    pvcSizeFromTemplate,
    requestSizeUnit,
    requestSizeValue,
    selectedOS,
    setAccessMode,
    setApplySP,
    setMountAsCDROM,
    setPvcName,
    setRequestSizeUnit,
    setRequestSizeValue,
    setStorageClassName,
    setVolumeMode,
    spAccessMode,
    spLoaded,
    spVolumeMode,
    storageClassName,
    volumeMode,
  } = useUploadPVCFormLogic({
    commonTemplates,
    fileValue,
    goldenPvcs,
    isLoading,
    ns,
    onChange,
    osParam,
    setDisableFormSubmit,
    storageClasses,
  });

  return (
    <>
      <FormGroup>
        <Alert isInline title={t('PersistentVolumeClaim creation')} variant={AlertVariant.info}>
          {t(
            'This PersistentVolumeClaim will be created using a DataVolume through Containerized Data Importer (CDI)',
          )}
        </Alert>
      </FormGroup>
      <UploadPVCFormFileInput
        fileName={fileName}
        fileValue={fileValue}
        handleFileChange={handleFileChange}
        handleFileNameChange={handleFileNameChange}
        handleGoldenCheckbox={handleGoldenCheckbox}
        isGolden={isGolden}
        operatingSystemHaveDV={!!operatingSystemHaveDV}
        setIsFileRejected={setIsFileRejected}
      />
      {isGolden && (
        <UploadPVCFormGoldenImage
          goldenPvcs={goldenPvcs}
          handleCDROMChange={(checked: boolean) => setMountAsCDROM(checked)}
          handleOs={handleOs}
          handlePvcSizeTemplate={handlePvcSizeTemplate}
          isLoading={isLoading}
          mountAsCDROM={mountAsCDROM}
          namespace={namespace}
          operatingSystems={operatingSystems}
          os={selectedOS}
          osImageExists={osImageExists}
          pvcSizeFromTemplate={pvcSizeFromTemplate}
        />
      )}
      <UploadPVCFormPVCName
        handlePvcName={(event) => setPvcName(event.currentTarget.value)}
        isGolden={isGolden}
        isLoading={isLoading}
        pvcName={pvcName}
      />
      <UploadPVCFormStorageSection
        applySP={applySP}
        loadError={loadError}
        requestSizeUnit={requestSizeUnit}
        requestSizeValue={requestSizeValue}
        setAccessMode={setAccessMode}
        setApplySP={setApplySP}
        setRequestSizeUnit={setRequestSizeUnit}
        setRequestSizeValue={setRequestSizeValue}
        setStorageClassName={setStorageClassName}
        setVolumeMode={setVolumeMode}
        spAccessMode={spAccessMode}
        spLoaded={spLoaded}
        spVolumeMode={spVolumeMode}
        storageClasses={storageClasses}
        storageClassName={storageClassName}
        volumeMode={volumeMode}
      />
    </>
  );
};

export default UploadPVCForm;
