import { type Dispatch, type FormEvent, type SetStateAction, useCallback } from 'react';
import axios from 'axios';

import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { createUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';

import { CDI_UPLOAD_URL_BUILDER, uploadErrorType } from '../utils/consts';
import { getName } from '../utils/selectors';

type UploadSaveParams = {
  dvObj: V1beta1DataVolume;
  fileName: string;
  fileValue: File;
  namespace: string;
  setError: Dispatch<SetStateAction<string>>;
  setIsAllocating: Dispatch<SetStateAction<boolean>>;
  setIsCheckingCertificate: Dispatch<SetStateAction<boolean>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  uploadData: (params: { file: File; namespace: string; pvcName: string; token: string }) => void;
  uploadProxyURL: string;
};

export const useUploadSave = ({
  dvObj,
  fileName,
  fileValue,
  namespace,
  setError,
  setIsAllocating,
  setIsCheckingCertificate,
  setIsSubmitting,
  uploadData,
  uploadProxyURL,
}: UploadSaveParams): ((e: FormEvent<EventTarget>) => void) =>
  useCallback(
    (e: FormEvent<EventTarget>): void => {
      e.preventDefault();
      if (!fileName) {
        setError(uploadErrorType.MISSING);
        return;
      }
      setIsCheckingCertificate(true);
      axios
        .get(CDI_UPLOAD_URL_BUILDER(uploadProxyURL))
        .catch((catchError) => {
          setIsCheckingCertificate(false);
          if (catchError?.response?.data === undefined) {
            throw new Error(uploadErrorType.CERT);
          }
        })
        .then(() => {
          setIsCheckingCertificate(false);
          setError('');
          setIsAllocating(true);
          setIsSubmitting(true);
          return createUploadPVC(dvObj);
        })
        .then(({ token }) => {
          setIsAllocating(false);
          uploadData({ file: fileValue, namespace, pvcName: getName(dvObj), token });
        })
        .catch((err) => {
          setIsAllocating(false);
          setError(err?.message ?? uploadErrorType.ALLOCATE);
        });
    },
    [
      dvObj,
      fileName,
      fileValue,
      namespace,
      setError,
      setIsAllocating,
      setIsCheckingCertificate,
      setIsSubmitting,
      uploadData,
      uploadProxyURL,
    ],
  );
