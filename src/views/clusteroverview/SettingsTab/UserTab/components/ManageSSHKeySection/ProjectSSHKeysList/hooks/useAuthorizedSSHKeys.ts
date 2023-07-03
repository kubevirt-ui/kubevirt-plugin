import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { ProjectSSHSecretMap } from '../utils/types';

type UseAuthorizedSSHKeys = () => {
  authorizedSSHKeys: ProjectSSHSecretMap;
  error: Error;
  isAddingKey: boolean;
  loaded: boolean;
  setIsAddingKey: Dispatch<SetStateAction<boolean>>;
  setSSHSecretKeys: Dispatch<SetStateAction<ProjectSSHSecretMap>>;
  sshSecretKeys: ProjectSSHSecretMap;
  updateAuthorizedSSHKeys: (val: any) => void;
};

const useAuthorizedSSHKeys: UseAuthorizedSSHKeys = () => {
  const [authorizedSSHKeys = {}, updateAuthorizedSSHKeys, loaded, error] =
    useKubevirtUserSettings('ssh');

  const [sshSecretKeys, setSSHSecretKeys] = useState<ProjectSSHSecretMap>({ '': '' });

  const [isAddingKey, setIsAddingKey] = useState(true);

  useEffect(() => {
    if (loaded && !isEmpty(authorizedSSHKeys)) {
      setSSHSecretKeys(authorizedSSHKeys);
      setIsAddingKey(false);
    }
  }, [loaded, authorizedSSHKeys]);

  return {
    authorizedSSHKeys,
    error,
    isAddingKey,
    loaded,
    setIsAddingKey,
    setSSHSecretKeys,
    sshSecretKeys,
    updateAuthorizedSSHKeys,
  };
};

export default useAuthorizedSSHKeys;
