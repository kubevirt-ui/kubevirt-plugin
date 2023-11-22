import { createContext } from 'react';

import { DataUpload, UploadDataProps } from './types';

export type CDIUploadContextProps = {
  uploadData: ({ file, namespace, pvcName, token }: UploadDataProps) => void;
  uploadProxyURL?: string;
  uploads: DataUpload[];
};

export const CDIUploadContext = createContext<CDIUploadContextProps>({
  uploadData: () => null,
  uploads: [],
});

export const CDIUploadProvider = CDIUploadContext.Provider;
