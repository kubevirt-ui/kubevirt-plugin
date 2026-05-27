import { useEffect, useMemo, useState } from 'react';

import { modelToGroupVersionKind,  NamespaceModel,  SecretModel,
 } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { checkAccess, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import { AuthKeyRow } from '../utils/types';

type UseSSHAuthNamespaces = (authKeyRows: AuthKeyRow[]) => {
  loaded: boolean;
  selectableNamespaces: string[];
};

const useSSHAuthNamespaces: UseSSHAuthNamespaces = (authKeyRows) => {
  const cluster = useSettingsCluster();
  const [namespaces, loaded] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NamespaceModel),
    isList: true,
    namespaced: false,
  });

  const [selectableNamespaces, setSelectableNamespaces] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  const selectedNamespaces = useMemo(
    () =>
      authKeyRows.reduce((acc, row) => {
        !isEmpty(row.namespaceName) && !isEmpty(row.secretName) && acc.push(row.namespaceName);
        return acc;
      }, []) || [],
    [authKeyRows],
  );

  useEffect(() => {
    if (!loaded) {
      setLoading(true);
      setSelectableNamespaces([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSelectableNamespaces([]);

    const namespaceNames = (namespaces ?? []).reduce<string[]>((acc, namespace) => {
      const nsName = getName(namespace);
      !selectedNamespaces.includes(nsName) && acc.push(nsName);

      return acc;
    }, []);

    const promises = namespaceNames.map((namespaceName) =>
      checkAccess({
        group: SecretModel.apiGroup,
        namespace: namespaceName,
        resource: SecretModel.plural,
        verb: 'create',
      }),
    );

    Promise.allSettled(promises)
      .then((settledResults) => {
        if (cancelled) return;

        const namespacesAllowedCreateSecret = settledResults
          .reduce<string[]>((acc, result) => {
            if (result.status !== 'fulfilled') return acc;

            const accessReview = result.value;
            if (
              accessReview?.status?.allowed &&
              accessReview?.spec?.resourceAttributes?.namespace
            ) {
              acc.push(accessReview.spec.resourceAttributes.namespace);
            }

            return acc;
          }, [])
          .sort((a, b) => a.localeCompare(b));

        setSelectableNamespaces(namespacesAllowedCreateSecret);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [namespaces, selectedNamespaces, loaded]);

  return { loaded: loaded && !loading, selectableNamespaces };
};

export default useSSHAuthNamespaces;
