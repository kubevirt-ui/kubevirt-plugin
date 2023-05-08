import { createContext } from 'react';

export type FileUploadContextType = {
  extensions: string[];
  fileUpload: File;
  setFileUpload: (file: File) => void;
};

export const FileUploadContext = createContext<FileUploadContextType>({
  fileUpload: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setFileUpload: () => {},
  extensions: [],
});
