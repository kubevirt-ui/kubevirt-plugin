import { useCallback, useEffect, useState } from 'react';

import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { initialAuthKeyRow } from '../utils/constants';
import { AuthKeyRow } from '../utils/types';

import useSSHAuthProjects from './useSSHAuthProjects';

type UseSSHAuthKeys = () => {
  authKeyRows: AuthKeyRow[];
  loaded: boolean;
  onAuthKeyAdd: () => void;
  onAuthKeyChange: (updatedKey: AuthKeyRow) => void;
  onAuthKeyDelete: (keyToRemove: AuthKeyRow) => void;
  selectableProjects: string[];
};

const useSSHAuthKeys: UseSSHAuthKeys = () => {
  const [authorizedSSHKeys = {}, updateAuthorizedSSHKeys, loadedSettings] =
    useKubevirtUserSettings('ssh');

  const [authKeyRows, setAuthKeyRows] = useState<AuthKeyRow[]>([initialAuthKeyRow]);
  const [isInitEffect, setIsInitEffect] = useState<boolean>(true);

  useEffect(() => {
    if (loadedSettings && isInitEffect) {
      !isEmpty(authorizedSSHKeys) &&
        setAuthKeyRows(
          Object.entries(authorizedSSHKeys).map(([projectName, secretName], id) => ({
            id,
            projectName,
            secretName,
          })),
        );

      setIsInitEffect(false);
    }
  }, [loadedSettings, authorizedSSHKeys, isInitEffect]);

  const { loaded, selectableProjects } = useSSHAuthProjects(authKeyRows);

  const onAuthKeyAdd = useCallback(() => {
    setAuthKeyRows((prevKeys) => [
      ...prevKeys,
      { id: prevKeys.at(-1).id + 1, projectName: '', secretName: '' },
    ]);
  }, []);

  const onAuthKeyChange = useCallback(
    (updatedKey: AuthKeyRow) => {
      setAuthKeyRows((prevKeys) =>
        prevKeys.map((key) => (key.id === updatedKey.id ? updatedKey : key)),
      );

      const { projectName, secretName } = updatedKey;
      if (!isEmpty(projectName) && !isEmpty(secretName)) {
        updateAuthorizedSSHKeys({
          ...authorizedSSHKeys,
          [projectName]: secretName,
        });
      }
    },
    [authorizedSSHKeys, updateAuthorizedSSHKeys],
  );

  const onAuthKeyDelete = useCallback(
    (keyToRemove: AuthKeyRow) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [keyToRemove.projectName]: _, ...rest } = authorizedSSHKeys;
      updateAuthorizedSSHKeys(rest);

      setAuthKeyRows((prevKeys) => {
        const updatedKeys = prevKeys.filter(({ id }) => id !== keyToRemove.id);
        return isEmpty(updatedKeys) ? [initialAuthKeyRow] : updatedKeys;
      });
    },
    [authorizedSSHKeys, updateAuthorizedSSHKeys],
  );

  return {
    authKeyRows,
    loaded: loaded && loadedSettings,
    onAuthKeyAdd,
    onAuthKeyChange,
    onAuthKeyDelete,
    selectableProjects,
  };
};

export default useSSHAuthKeys;
