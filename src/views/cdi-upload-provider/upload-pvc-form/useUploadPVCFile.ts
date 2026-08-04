import { useState } from 'react';

type UseUploadPVCFileResult = {
  fileName: string;
  fileNameExtension: string;
  fileValue: File;
  handleFileChange: (_event: unknown, value: File) => void;
  handleFileNameChange: (_event: unknown, filename: string) => void;
  isFileRejected: boolean;
  setIsFileRejected: (value: boolean) => void;
};

export const useUploadPVCFile = (): UseUploadPVCFileResult => {
  const [fileValue, setFileValue] = useState<File>(null);
  const [fileName, setFileName] = useState('');
  const [fileNameExtension, setFileNameExtension] = useState('');
  const [isFileRejected, setIsFileRejected] = useState(false);

  const handleFileChange = (_event: unknown, value: File): void => {
    setFileValue(value);
    setIsFileRejected(false);
  };

  const handleFileNameChange = (_event: unknown, filename: string): void => {
    setFileName(filename);
    setFileNameExtension(/[.][^.]+$/.exec(filename)?.toString());
  };

  return {
    fileName,
    fileNameExtension,
    fileValue,
    handleFileChange,
    handleFileNameChange,
    isFileRejected,
    setIsFileRejected,
  };
};
