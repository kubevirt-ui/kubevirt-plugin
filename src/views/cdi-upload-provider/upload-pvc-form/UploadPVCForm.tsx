import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getDefaultStorageClass } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { BinaryUnit } from '@kubevirt-utils/utils/units';
import {
  Alert,
  AlertVariant,
  Checkbox,
  FileUpload,
  Split,
  SplitItem,
} from '@patternfly/react-core';

import {
  getGiBUploadPVCSizeByImage,
  getName,
  getNamespace,
  getTemplateOperatingSystems,
} from '../utils/selectors';
import { OperatingSystemRecord } from '../utils/types';
import { updateDV } from '../utils/utils';

import UploadPVCFormGoldenImage from './UploadPVCFormGoldenImage';
import UploadPVCFormMode from './UploadPVCFormMode';
import UploadPVCFormPVCName from './UploadPVCFormPVCName';
import UploadPVCFormSize from './UploadPVCFormSize';
import UploadPVCFormStorageClass from './UploadPVCFormStorageClass';

import './upload-pvc-form.scss';

type UploadPVCFormProps = {
  commonTemplates: V1Template[];
  fileName: string;
  fileValue: File | string;
  goldenPvcs: V1alpha1PersistentVolumeClaim[];
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
  const operatingSystems = getTemplateOperatingSystems(commonTemplates).filter(
    (o) => !o?.isSourceRef,
  );
  const operatingSystemHaveDV = operatingSystems?.find(
    (os) => os?.baseImageName && os?.baseImageNamespace,
  );
  const [storageClassName, setStorageClassName] = useState<string>('');
  const [pvcName, setPvcName] = useState<string>('');
  const [namespace, setNamespace] = useState<string>(ns);
  const [accessMode, setAccessMode] = useState<string>('');
  const [volumeMode, setVolumeMode] = useState<string>();
  const [requestSizeValue, setRequestSizeValue] = useState<string>('');
  const [requestSizeUnit, setRequestSizeUnit] = useState<string>('Gi');
  const [isGolden, setIsGolden] = useState<boolean>(!!osParam);
  const [os, setOs] = useState<OperatingSystemRecord>();
  const [pvcSizeFromTemplate, setPvcSizeFromTemplate] = useState<boolean>(false);
  const [mountAsCDROM, setMountAsCDROM] = useState<boolean>();
  const [osImageExists, setOsImageExists] = useState<boolean>(false);
  const defaultSCName = getDefaultStorageClass(storageClasses)?.metadata?.name;
  const [applySP, setApplySP] = useState<boolean>(true);
  const {
    claimPropertySets,
    error: loadError,
    loaded: spLoaded,
  } = useStorageProfileClaimPropertySets(storageClassName || defaultSCName);
  const { accessModes: spAccessMode, volumeMode: spVolumeMode } = claimPropertySets?.[0] || {};

  useEffect(() => {
    !storageClassName && setStorageClassName(defaultSCName ?? storageClasses?.[0]?.metadata?.name);
  }, [defaultSCName, storageClassName, storageClasses]);

  useEffect(() => {
    const value = getGiBUploadPVCSizeByImage((fileValue as File)?.size);
    const isIso = (fileValue as File)?.name?.toLowerCase().endsWith('.iso');
    setMountAsCDROM(isIso);
    setPvcSizeFromTemplate(!isIso);
    setRequestSizeValue(isIso ? value?.toString() : os?.baseImageRecomendedSize[0] || '');
    setRequestSizeUnit(os?.baseImageRecomendedSize[1] || BinaryUnit.Gi);
  }, [fileValue, os]);

  useEffect(() => {
    if (storageClassName && spLoaded && applySP) {
      spAccessMode[0] !== accessMode && setAccessMode(spAccessMode[0]);
      spVolumeMode !== volumeMode && setVolumeMode(spVolumeMode);
    }
  }, [spLoaded, spAccessMode, spVolumeMode, accessMode, volumeMode, storageClassName, applySP]);

  useEffect(() => {
    onChange(
      updateDV({
        accessMode,
        mountAsCDROM,
        namespace,
        pvcName,
        requestSizeUnit,
        requestSizeValue,
        storageClassName,
        volumeMode,
      }),
    );
  }, [
    accessMode,
    volumeMode,
    namespace,
    pvcName,
    onChange,
    mountAsCDROM,
    storageClassName,
    requestSizeValue,
    requestSizeUnit,
  ]);

  const handleGoldenCheckbox = (checked: boolean) => {
    setIsGolden(checked);
    if (checked) {
      setNamespace(os?.baseImageNamespace);
      setPvcName(pvcName && !os ? '' : os?.baseImageName);
      return;
    }
    setNamespace(ns);
  };

  const handleOs = (newOs: string) => {
    const operatingSystem = operatingSystems?.find((o) => o.id === newOs);
    setOs(operatingSystem);
    setPvcName(operatingSystem?.baseImageName);
    operatingSystem?.baseImageNamespace && setNamespace(operatingSystem.baseImageNamespace);
  };

  const handlePvcSizeTemplate = (checked: boolean) => {
    setPvcSizeFromTemplate(checked);
    setRequestSizeValue(
      checked
        ? os?.baseImageRecomendedSize?.[0] || ''
        : getGiBUploadPVCSizeByImage((fileValue as File)?.size)?.toString(),
    );
  };

  useEffect(() => {
    !isLoading && osParam && handleOs(osParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    const goldenImagePVC = goldenPvcs?.find(
      (pvc) => getName(pvc) === os?.baseImageName && getNamespace(pvc) === os?.baseImageNamespace,
    );
    if (goldenImagePVC) {
      setOsImageExists(true);
      setDisableFormSubmit(true);
      return;
    }
    if (osImageExists) {
      setOsImageExists(false);
      setDisableFormSubmit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goldenPvcs, os]);

  return (
    <div>
      <div className="form-group">
        <Alert isInline title={t('Persistent Volume Claim creation')} variant={AlertVariant.info}>
          {t(
            'This Persistent Volume Claim will be created using a DataVolume through Containerized Data Importer (CDI)',
          )}
        </Alert>
      </div>
      <label className="control-label co-required" htmlFor="file-upload">
        {t('Upload data')}
      </label>
      <div className="form-group">
        <FileUpload
          dropzoneProps={{
            accept: { 'application/*': ['.iso,.img,.qcow2,.gz,.xz'] },
            onDropAccepted: () => setIsFileRejected(false),
            onDropRejected: () => setIsFileRejected(true),
          }}
          onClearClick={(event) => {
            handleFileChange(event, null);
            handleFileNameChange(event, '');
          }}
          onFileInputChange={(event, file: File) => {
            handleFileChange(event, file);
            handleFileNameChange(event, file.name);
          }}
          browseButtonText="Upload"
          filename={fileName}
          filenamePlaceholder="Drag and drop a file or upload one"
          hideDefaultPreview
          id="file-upload"
          value={fileValue}
        />
        {operatingSystemHaveDV && (
          <Checkbox
            className="kv--create-upload__golden-switch"
            data-checked-state={isGolden}
            id="golden-os-switch"
            isChecked={isGolden}
            label={t('Attach this data to a Virtual Machine operating system')}
            onChange={(_event, checked: boolean) => handleGoldenCheckbox(checked)}
          />
        )}
      </div>
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
          os={os}
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
      <div className="form-group">
        <Split hasGutter>
          <SplitItem className="kv--create-upload__flexitem">
            <UploadPVCFormStorageClass
              applySP={applySP}
              setApplySP={setApplySP}
              setStorageClassName={setStorageClassName}
              storageClasses={storageClasses}
              storageClassName={storageClassName}
            />
          </SplitItem>
          <SplitItem className="kv--create-upload__flexitem">
            <UploadPVCFormSize
              requestSizeUnit={requestSizeUnit}
              requestSizeValue={requestSizeValue}
              setRequestSizeUnit={setRequestSizeUnit}
              setRequestSizeValue={setRequestSizeValue}
            />
          </SplitItem>
        </Split>
      </div>
      {!spLoaded && !loadError ? (
        <Loading />
      ) : (
        <UploadPVCFormMode
          accessMode={spAccessMode?.[0]}
          applySP={applySP}
          setAccessMode={setAccessMode}
          setVolumeMode={setVolumeMode}
          storageClasses={storageClasses}
          storageClassName={storageClassName}
          volumeMode={volumeMode ?? spVolumeMode}
        />
      )}
    </div>
  );
};

export default UploadPVCForm;
