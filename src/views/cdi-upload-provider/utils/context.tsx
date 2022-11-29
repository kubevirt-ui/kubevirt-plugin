import { createContext } from 'react';

import { DataUpload, UploadDataProps } from './types';

export type CDIUploadContextProps = {
  uploads: DataUpload[];
  uploadData: ({ file, token, pvcName, namespace }: UploadDataProps) => void;
  uploadProxyURL?: string;
};

export const CDIUploadContext = createContext<CDIUploadContextProps>({
  uploads: [],
  uploadData: () => null,
});

export const CDIUploadProvider = CDIUploadContext.Provider;
