import { useEffect, useMemo, useState } from 'react';

import {
  modelToGroupVersionKind,
  ProjectModel,
  SecretModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { checkAccess, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import { AuthKeyRow } from '../utils/types';

type UseSSHAuthProjects = (authKeyRows: AuthKeyRow[]) => {
  loaded: boolean;
  selectableProjects: string[];
};

const useSSHAuthProjects: UseSSHAuthProjects = (authKeyRows) => {
  const cluster = useSettingsCluster();
  const [projects, loaded] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const [selectableProjects, setSelectableProjects] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  const selectedProjects = useMemo(
    () =>
      authKeyRows.reduce((acc, row) => {
        !isEmpty(row.projectName) && !isEmpty(row.secretName) && acc.push(row.projectName);
        return acc;
      }, []) || [],
    [authKeyRows],
  );

  useEffect(() => {
    if (!loaded) {
      setLoading(true);
      setSelectableProjects([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSelectableProjects([]);

    const projectNames = (projects ?? []).reduce<string[]>((acc, project) => {
      const projName = getName(project);
      !selectedProjects.includes(projName) && acc.push(projName);

      return acc;
    }, []);

    const promises = projectNames.map((projectName) =>
      checkAccess({
        group: SecretModel.apiGroup,
        namespace: projectName,
        resource: SecretModel.plural,
        verb: 'create',
      }),
    );

    Promise.allSettled(promises)
      .then((settledResults) => {
        if (cancelled) return;

        const projectsAllowedCreateSecret = settledResults
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

        setSelectableProjects(projectsAllowedCreateSecret);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projects, selectedProjects, loaded]);

  return { loaded: loaded && !loading, selectableProjects };
};

export default useSSHAuthProjects;
