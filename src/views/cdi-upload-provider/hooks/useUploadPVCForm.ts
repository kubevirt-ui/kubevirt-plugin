import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';

import { PersistentVolumeClaimModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { createUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';

import { CDI_UPLOAD_URL_BUILDER, uploadErrorType } from '../utils/consts';
import { type CDIUploadContextProps } from '../utils/context';
import { getName, getNamespace } from '../utils/selectors';
import { resourcePath } from '../utils/utils';

type UseUploadPVCFormParams = {
  errorPvcs: Error;
  errorTemplates: Error;
  namespaceParam: string;
  uploadContext: CDIUploadContextProps;
};

type UseUploadPVCFormResult = {
  disableFormSubmit: boolean;
  dvObj: V1beta1DataVolume;
  error: string;
  fileName: string;
  fileNameExtText: string;
  fileValue: File;
  handleFileChange: (_event: unknown, value: File) => void;
  handleFileNameChange: (_event: unknown, filename: string) => void;
  isAllocating: boolean;
  isCheckingCertificate: boolean;
  isFileRejected: boolean;
  isSubmitting: boolean;
  namespace: string;
  onCancel: () => void;
  onErrorClick: () => void;
  onSuccessClick: () => void;
  save: (e: FormEvent<EventTarget>) => void;
  setDisableFormSubmit: React.Dispatch<React.SetStateAction<boolean>>;
  setDvObj: React.Dispatch<React.SetStateAction<V1beta1DataVolume>>;
  setIsFileRejected: React.Dispatch<React.SetStateAction<boolean>>;
};

const useUploadPVCForm = (
  { errorPvcs, errorTemplates, namespaceParam, uploadContext }: UseUploadPVCFormParams,
  t: (key: string, options?: Record<string, string>) => string,
): UseUploadPVCFormResult => {
  const navigate = useNavigate();
  const { uploadData, uploadProxyURL } = uploadContext;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCertificate, setIsCheckingCertificate] = useState(false);
  const [disableFormSubmit, setDisableFormSubmit] = useState(false);
  const [fileValue, setFileValue] = useState<File>(null);
  const [fileName, setFileName] = useState('');
  const [fileNameExtension, setFileNameExtension] = useState('');
  const [isFileRejected, setIsFileRejected] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAllocating, setIsAllocating] = useState(false);
  const [dvObj, setDvObj] = useState<V1beta1DataVolume>(null);

  const namespace = getNamespace(dvObj) ?? namespaceParam;

  const fileNameExtText = fileNameExtension
    ? t('Detected file extension is {{fileNameExtension}}', { fileNameExtension })
    : t('No file extension detected');

  const save = (e: FormEvent<EventTarget>): void => {
    e.preventDefault();
    if (!fileName) {
      setError(uploadErrorType.MISSING);
    } else {
      setIsCheckingCertificate(true);
      void axios
        .get(CDI_UPLOAD_URL_BUILDER(uploadProxyURL))
        .catch((catchError) => {
          setIsCheckingCertificate(false);
          if (catchError?.response?.data === undefined) {
            throw new Error(uploadErrorType.CERT);
          }
        })
        .then(() => {
          setError('');
          setIsAllocating(true);
          setIsSubmitting(true);
          return createUploadPVC(dvObj);
        })
        .then(({ token }) => {
          setIsAllocating(false);
          uploadData({
            file: fileValue,
            namespace,
            pvcName: getName(dvObj),
            token,
          });
        })
        .catch((err) => {
          setIsAllocating(false);
          setError(err?.message ?? uploadErrorType.ALLOCATE);
        });
    }
  };

  const handleFileChange = (_event: unknown, value: File): void => {
    setFileValue(value);
    setIsFileRejected(false);
    setError('');
  };

  const handleFileNameChange = (_event: unknown, filename: string): void => {
    setFileName(filename);
    setFileNameExtension(/[.][^.]+$/.exec(filename)?.toString());
  };

  useEffect(() => {
    if (errorTemplates || errorPvcs) {
      setError(errorTemplates?.message ?? errorPvcs?.message);
    }
  }, [errorTemplates, errorPvcs]);

  const onCancel = useCallback((): void => {
    void navigate(resourcePath(PersistentVolumeClaimModel));
  }, [navigate]);

  const onErrorClick = useCallback((): void => {
    setIsSubmitting(false);
    setError('');
  }, []);

  const onSuccessClick = useCallback((): void => {
    void navigate(resourcePath(PersistentVolumeClaimModel, getName(dvObj), namespace));
  }, [dvObj, namespace, navigate]);

  return {
    disableFormSubmit,
    dvObj,
    error,
    fileName,
    fileNameExtText,
    fileValue,
    handleFileChange,
    handleFileNameChange,
    isAllocating,
    isCheckingCertificate,
    isFileRejected,
    isSubmitting,
    namespace,
    onCancel,
    onErrorClick,
    onSuccessClick,
    save,
    setDisableFormSubmit,
    setDvObj,
    setIsFileRejected,
  };
};

export default useUploadPVCForm;
