import { useCallback, useEffect, useState } from 'react';

import { SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sGet, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { AuthKeyRow } from '../utils/types';
import { createAuthKeyRow } from '../utils/utils';

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
  const filteredRows = await Promise.all(
    rows.map(async (row) => {
      if (!row?.projectName || !row?.secretName) return null;

      try {
        await k8sGet({
          model: SecretModel,
          name: row.secretName,
          ns: row.projectName,
        });
        return row;
      } catch {
        return null;
      }
    }),
  );

  const validRows = filteredRows.filter((r): r is AuthKeyRow => r !== null);

  return validRows.length > 0 ? validRows : [createAuthKeyRow(rows[0].projectName)];
};

const useSSHAuthKeys: UseSSHAuthKeys = () => {
  const [authorizedSSHKeys = {}, updateAuthorizedSSHKeys, loadedSettings] =
    useKubevirtUserSettings('ssh');

  const [activeNamespace] = useActiveNamespace();

  const [authKeyRows, setAuthKeyRows] = useState<AuthKeyRow[]>([createAuthKeyRow(activeNamespace)]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (loadedSettings) {
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
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [loadedSettings, authorizedSSHKeys]);

  const { loaded, selectableProjects } = useSSHAuthProjects(authKeyRows);

  const onAuthKeyAdd = useCallback(() => {
    setAuthKeyRows((prevKeys) => [
      ...prevKeys,
      createAuthKeyRow(activeNamespace, prevKeys.at(-1).id + 1),
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
        return isEmpty(updatedKeys) ? [createAuthKeyRow(activeNamespace)] : updatedKeys;
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
