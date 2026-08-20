import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { PersistentVolumeClaimModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useReadyStorageClasses from '@kubevirt-utils/hooks/useReadyStorageClasses/useReadyStorageClasses';

import { CDIUploadContext } from '../utils/context';
import { resourcePath } from '../utils/resourceUtils';
import { getNamespace } from '../utils/selectors';
import { useUploadPVCFile } from './useUploadPVCFile';
import { useUploadPVCTemplates } from './useUploadPVCTemplates';
import { useUploadSave } from './useUploadSave';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useUploadPVCState = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCertificate, setIsCheckingCertificate] = useState(false);
  const [disableFormSubmit, setDisableFormSubmit] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAllocating, setIsAllocating] = useState(false);
  const [dvObj, setDvObj] = useState<V1beta1DataVolume>(null);

  const navigate = useNavigate();
  const templates = useUploadPVCTemplates();
  const file = useUploadPVCFile();
  const { uploadData, uploadProxyURL, uploads } = useContext(CDIUploadContext);
  const [{ readyStorageClasses }, scLoaded] = useReadyStorageClasses();
  const namespaceParam = useNamespaceParam();
  const namespace = getNamespace(dvObj) ?? namespaceParam;

  const save = useUploadSave({
    dvObj,
    fileName: file.fileName,
    fileValue: file.fileValue,
    namespace,
    setError,
    setIsAllocating,
    setIsCheckingCertificate,
    setIsSubmitting,
    uploadData,
    uploadProxyURL,
  });

  const handleFileChange = (_event: unknown, value: File): void => {
    file.handleFileChange(_event, value);
    setError('');
  };

  useEffect(() => {
    if (templates.errorTemplates || templates.errorPvcs) {
      setError(templates.errorTemplates?.message ?? templates.errorPvcs?.message);
    }
  }, [templates.errorTemplates, templates.errorPvcs]);

  const onCancel = useCallback(() => {
    navigate(resourcePath(PersistentVolumeClaimModel));
  }, [navigate]);

  return {
    ...templates,
    ...file,
    disableFormSubmit,
    dvObj,
    error,
    handleFileChange,
    isAllocating,
    isCheckingCertificate,
    isSubmitting,
    namespace,
    namespaceParam,
    onCancel,
    readyStorageClasses,
    save,
    scLoaded,
    setDisableFormSubmit,
    setDvObj,
    setError,
    setIsSubmitting,
    uploadProxyURL,
    uploads,
  };
};
