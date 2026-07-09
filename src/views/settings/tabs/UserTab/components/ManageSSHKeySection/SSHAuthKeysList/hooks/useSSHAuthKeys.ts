import { useCallback, useEffect, useState } from 'react';

import { SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import { type AuthKeyRow } from '../utils/types';
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

const filterAuthRows = async (rows: AuthKeyRow[], cluster?: string): Promise<AuthKeyRow[]> => {
  const filteredRows = await Promise.all(
    rows.map(async (row) => {
      if (!row?.projectName || !row?.secretName) return null;

      try {
        await kubevirtK8sGet({
          cluster,
          model: SecretModel,
          name: row.secretName as string,
          ns: row.projectName,
        });
        return row;
      } catch {
        return null;
      }
    }),
  );

  const validRows = filteredRows.filter((row): row is AuthKeyRow => row !== null);

  return validRows.length > 0 ? validRows : [createAuthKeyRow(rows[0].projectName)];
};

const useSSHAuthKeys: UseSSHAuthKeys = () => {
  const cluster = useSettingsCluster();
  const [rawSSHKeys = {}, updateAuthorizedSSHKeys, loadedSettings] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.ssh,
    cluster,
  );
  const authorizedSSHKeys = rawSSHKeys as Record<string, string>;

  const [activeNamespace] = useActiveNamespace();

  const [authKeyRows, setAuthKeyRows] = useState<AuthKeyRow[]>(() => [
    createAuthKeyRow(activeNamespace),
  ]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (loadedSettings) {
      if (!isEmpty(authorizedSSHKeys)) {
        const authRows: AuthKeyRow[] = Object.entries(authorizedSSHKeys).map(
          ([projectName, secretName], index) => ({
            id: index,
            projectName,
            secretName,
          }),
        );

        filterAuthRows(authRows, cluster)
          .then((filteredRows) => {
            setAuthKeyRows(filteredRows);
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [loadedSettings, authorizedSSHKeys, cluster]);

  const { loaded, selectableProjects } = useSSHAuthProjects(authKeyRows);

  const onAuthKeyAdd = useCallback(() => {
    setAuthKeyRows((prevKeys) => [
      ...prevKeys,
      createAuthKeyRow(activeNamespace, prevKeys.at(-1).id + 1),
    ]);
  }, [activeNamespace]);

  const onAuthKeyChange = useCallback(
    (updatedKey: AuthKeyRow) => {
      setAuthKeyRows((prevKeys) =>
        prevKeys.map((key) => (key.id === updatedKey.id ? updatedKey : key)),
      );

      const { projectName, secretName } = updatedKey as { projectName: string; secretName: string };
      if (!isEmpty(projectName) && !isEmpty(secretName)) {
        void updateAuthorizedSSHKeys({
          ...(authorizedSSHKeys as Record<string, string>),
          [projectName]: secretName,
        });
      }
    },
    [authorizedSSHKeys, updateAuthorizedSSHKeys],
  );

  const onAuthKeyDelete = useCallback(
    (keyToRemove: AuthKeyRow) => {
      const { [keyToRemove.projectName]: _unused, ...rest } = authorizedSSHKeys;
      void updateAuthorizedSSHKeys(rest);

      setAuthKeyRows((prevKeys) => {
        const updatedKeys = prevKeys.filter(({ id }) => id !== keyToRemove.id);
        return isEmpty(updatedKeys) ? [createAuthKeyRow(activeNamespace)] : updatedKeys;
      });
    },
    [activeNamespace, authorizedSSHKeys, updateAuthorizedSSHKeys],
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
