import { useCallback, useEffect, useState } from 'react';

import { SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import { AuthKeyRow } from '../utils/types';
import { createAuthKeyRow } from '../utils/utils';

import useSSHAuthNamespaces from './useSSHAuthNamespaces';

type UseSSHAuthKeys = () => {
  authKeyRows: AuthKeyRow[];
  loaded: boolean;
  onAuthKeyAdd: () => void;
  onAuthKeyChange: (updatedKey: AuthKeyRow) => void;
  onAuthKeyDelete: (keyToRemove: AuthKeyRow) => void;
  selectableNamespaces: string[];
};

const filterAuthRows = async (rows: AuthKeyRow[], cluster?: string) => {
  const filteredRows = await Promise.all(
    rows.map(async (row) => {
      if (!row?.namespaceName || !row?.secretName) return null;

      try {
        await kubevirtK8sGet({
          cluster,
          model: SecretModel,
          name: row.secretName,
          ns: row.namespaceName,
        });
        return row;
      } catch {
        return null;
      }
    }),
  );

  const validRows = filteredRows.filter((r): r is AuthKeyRow => r !== null);

  return validRows.length > 0 ? validRows : [createAuthKeyRow(rows[0].namespaceName)];
};

const useSSHAuthKeys: UseSSHAuthKeys = () => {
  const cluster = useSettingsCluster();
  const [authorizedSSHKeys = {}, updateAuthorizedSSHKeys, loadedSettings] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.ssh,
    cluster,
  );

  const [activeNamespace] = useActiveNamespace();

  const [authKeyRows, setAuthKeyRows] = useState<AuthKeyRow[]>([createAuthKeyRow(activeNamespace)]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (loadedSettings) {
      if (!isEmpty(authorizedSSHKeys)) {
        const authRows: AuthKeyRow[] = Object.entries(authorizedSSHKeys).map(
          ([namespaceName, secretName], id) => ({
            id,
            namespaceName,
            secretName,
          }),
        );

        filterAuthRows(authRows, cluster)
          .then((filteredRows) => {
            setAuthKeyRows(filteredRows);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [loadedSettings, authorizedSSHKeys, cluster]);

  const { loaded, selectableNamespaces } = useSSHAuthNamespaces(authKeyRows);

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

      const { namespaceName, secretName } = updatedKey;
      if (!isEmpty(namespaceName) && !isEmpty(secretName)) {
        updateAuthorizedSSHKeys({
          ...authorizedSSHKeys,
          [namespaceName]: secretName,
        });
      }
    },
    [authorizedSSHKeys, updateAuthorizedSSHKeys],
  );

  const onAuthKeyDelete = useCallback(
    (keyToRemove: AuthKeyRow) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [keyToRemove.namespaceName]: _, ...rest } = authorizedSSHKeys;
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
    selectableNamespaces,
  };
};

export default useSSHAuthKeys;
