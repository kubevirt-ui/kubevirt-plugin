import { useCallback, useEffect, useState } from 'react';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

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

const filterAuthRows = async (rows: AuthKeyRow[]) => {
  const filteredRowsPromises: Promise<AuthKeyRow>[] = rows.map(async (row) => {
    try {
      await k8sGet({
        model: SecretModel,
        name: row.secretName,
        ns: row.projectName,
      }); // Assuming k8sGet returns an object or throws an error
      return row;
    } catch (error) {
      // If an error occurs during k8sGet, return a new object representing the error
      return { ...row, secretName: '' };
    }
  });

  return Promise.all(filteredRowsPromises);
};

const useSSHAuthKeys: UseSSHAuthKeys = () => {
  const [authorizedSSHKeys = {}, updateAuthorizedSSHKeys, loadedSettings] =
    useKubevirtUserSettings('ssh');

  const [authKeyRows, setAuthKeyRows] = useState<AuthKeyRow[]>([initialAuthKeyRow]);
  const [isInitEffect, setIsInitEffect] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (loadedSettings && isInitEffect) {
      if (!isEmpty(authorizedSSHKeys)) {
        const authRows: AuthKeyRow[] = Object.entries(authorizedSSHKeys).map(
          ([projectName, secretName], id) => ({
            id,
            projectName,
            secretName,
          }),
        );

        filterAuthRows(authRows)
          .then((filteredRows) => {
            setAuthKeyRows(filteredRows);
          })
          .finally(() => {
            setLoading(false);
          });
      }

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
    loaded: loaded && loadedSettings && !loading,
    onAuthKeyAdd,
    onAuthKeyChange,
    onAuthKeyDelete,
    selectableProjects,
  };
};

export default useSSHAuthKeys;
