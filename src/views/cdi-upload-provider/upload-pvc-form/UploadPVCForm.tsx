import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/components/DiskModal/DiskFormFields/hooks/useStorageProfileClaimPropertySets';
import { getDefaultStorageClass } from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/helpers';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  ns: string;
  fileValue: string | File;
  fileName: string;
  osParam?: string;
  isLoading: boolean;
  setDisableFormSubmit: Dispatch<SetStateAction<boolean>>;
  commonTemplates: V1Template[];
  goldenPvcs: V1alpha1PersistentVolumeClaim[];
  setIsFileRejected: Dispatch<SetStateAction<boolean>>;
  storageClasses: IoK8sApiStorageV1StorageClass[];
  onChange: (K8sResourceKind) => void;
  handleFileChange: (value, filename, event) => void;
};

const UploadPVCForm: FC<UploadPVCFormProps> = ({
  onChange,
  fileName,
  handleFileChange,
  fileValue,
  commonTemplates,
  goldenPvcs,
  osParam,
  isLoading,
  setIsFileRejected,
  setDisableFormSubmit,
  storageClasses,
  ns,
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
    loaded: spLoaded,
    error: loadError,
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
        pvcName,
        namespace,
        mountAsCDROM,
        storageClassName,
        accessMode,
        volumeMode,
        requestSizeValue,
        requestSizeUnit,
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
        <Alert title={t('Persistent Volume Claim creation')} variant={AlertVariant.info} isInline>
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
          id="file-upload"
          value={fileValue}
          filename={fileName}
          onChange={handleFileChange}
          hideDefaultPreview
          isRequired
          dropzoneProps={{
            accept: '.iso,.img,.qcow2,.gz,.xz',
            onDropRejected: () => setIsFileRejected(true),
            onDropAccepted: () => setIsFileRejected(false),
          }}
        />
        {operatingSystemHaveDV && (
          <Checkbox
            id="golden-os-switch"
            className="kv--create-upload__golden-switch"
            label={t('Attach this data to a Virtual Machine operating system')}
            isChecked={isGolden}
            data-checked-state={isGolden}
            onChange={handleGoldenCheckbox}
          />
        )}
      </div>
      {isGolden && (
        <UploadPVCFormGoldenImage
          pvcSizeFromTemplate={pvcSizeFromTemplate}
          handleCDROMChange={(checked: boolean) => setMountAsCDROM(checked)}
          handlePvcSizeTemplate={handlePvcSizeTemplate}
          namespace={namespace}
          os={os}
          operatingSystems={operatingSystems}
          isLoading={isLoading}
          handleOs={handleOs}
          mountAsCDROM={mountAsCDROM}
          osImageExists={osImageExists}
          goldenPvcs={goldenPvcs}
        />
      )}
      <UploadPVCFormPVCName
        pvcName={pvcName}
        handlePvcName={(event) => setPvcName(event.currentTarget.value)}
        isGolden={isGolden}
        isLoading={isLoading}
      />
      <div className="form-group">
        <Split hasGutter>
          <SplitItem className="kv--create-upload__flexitem">
            <UploadPVCFormStorageClass
              storageClasses={storageClasses}
              applySP={applySP}
              setApplySP={setApplySP}
              storageClassName={storageClassName}
              setStorageClassName={setStorageClassName}
            />
          </SplitItem>
          <SplitItem className="kv--create-upload__flexitem">
            <UploadPVCFormSize
              setRequestSizeValue={setRequestSizeValue}
              setRequestSizeUnit={setRequestSizeUnit}
              requestSizeUnit={requestSizeUnit}
              requestSizeValue={requestSizeValue}
            />
          </SplitItem>
        </Split>
      </div>
      {!spLoaded && !loadError ? (
        <Loading />
      ) : (
        <UploadPVCFormMode
          applySP={applySP}
          volumeMode={volumeMode ?? spVolumeMode}
          accessMode={spAccessMode?.[0]}
          setVolumeMode={setVolumeMode}
          setAccessMode={setAccessMode}
          storageClassName={storageClassName}
          storageClasses={storageClasses}
        />
      )}
    </div>
  );
};

export default UploadPVCForm;
