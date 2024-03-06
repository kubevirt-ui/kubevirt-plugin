import { useEffect, useMemo, useState } from 'react';

import {
  modelToGroupVersionKind,
  ProjectModel,
  SecretModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  checkAccess,
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { AuthKeyRow } from '../utils/types';

type UseSSHAuthProjects = (authKeyRows: AuthKeyRow[]) => {
  loaded: boolean;
  selectableProjects: string[];
};

const useSSHAuthProjects: UseSSHAuthProjects = (authKeyRows) => {
  const [projects, loaded] = useK8sWatchResource<K8sResourceCommon[]>({
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
    if (loaded) {
      const projectNames = projects?.reduce((acc, project) => {
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

      Promise.all(promises)
        .then((accessReviewResults) => {
          const projectsAllowedCreateSecret = accessReviewResults
            .reduce((acc, accessReview) => {
              accessReview?.status?.allowed &&
                acc.push(accessReview?.spec?.resourceAttributes?.namespace);

              return acc;
            }, [])
            .sort((a, b) => a?.localeCompare(b));

          setSelectableProjects(projectsAllowedCreateSecret);
        })
        .finally(() => setLoading(false));
    }
  }, [projects, selectedProjects, loaded]);

  return { loaded: loaded && !loading, selectableProjects };
};

export default useSSHAuthProjects;
