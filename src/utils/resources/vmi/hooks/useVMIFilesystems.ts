import { useEffect, useState } from 'react';

import {
  type V1VirtualMachineInstance,
  type V1VirtualMachineInstanceFileSystem,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useVMISubresourceURL from '@multicluster/hooks/useVMISubresourceURL';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

type FilesystemListResponse = {
  items?: V1VirtualMachineInstanceFileSystem[];
};

type UseVMIFilesystems = (
  vmi?: V1VirtualMachineInstance,
) => [V1VirtualMachineInstanceFileSystem[], boolean, Error | null];

export const useVMIFilesystems: UseVMIFilesystems = (vmi) => {
  const [loaded, setLoaded] = useState(false);
  const [filesystems, setFilesystems] = useState<V1VirtualMachineInstanceFileSystem[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [url, urlLoaded] = useVMISubresourceURL(vmi, 'filesystemlist');

  useEffect(() => {
    if (!urlLoaded) return;

    const guestOS = vmi?.status?.guestOSInfo?.id;

    setError(null);
    if (guestOS) {
      (async (): Promise<void> => {
        const response = await consoleFetch(url);
        const jsonData = (await response.json()) as FilesystemListResponse;
        setFilesystems(jsonData?.items ?? []);
        setLoaded(true);
      })().catch((err: Error) => {
        setError(err);
        setLoaded(true);
      });
    }
    (!vmi || (!guestOS && vmi?.metadata)) && setLoaded(true);
  }, [url, loaded, vmi, urlLoaded]);

  return [filesystems, loaded, error];
};
