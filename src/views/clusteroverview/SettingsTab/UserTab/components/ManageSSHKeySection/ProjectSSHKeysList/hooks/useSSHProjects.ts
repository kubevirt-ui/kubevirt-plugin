import { useEffect, useMemo, useState } from 'react';

import {
  modelToGroupVersionKind,
  ProjectModel,
  SecretModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  checkAccess,
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { ProjectSSHSecretMap } from '../utils/types';

type UseSSHProjects = (sshSecretKeys: ProjectSSHSecretMap) => {
  loaded: boolean;
  projectsWithoutSSHKey: string[];
  projectsWithSSHKey: string[];
};

const useSSHProjects: UseSSHProjects = (sshSecretKeys) => {
  const [projects, loaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const [projectsWithoutSSHKey, setProjectsWithoutSSHKey] = useState<string[]>([]);

  const projectsWithSSHKey = useMemo(() => Object.keys(sshSecretKeys) || [], [sshSecretKeys]);

  useEffect(() => {
    if (loaded) {
      const projectNames = projects
        ?.filter((project) => !projectsWithSSHKey.includes(getName(project)))
        .map(getName);

      const promises = projectNames.map((projectName) =>
        checkAccess({
          group: SecretModel.apiGroup,
          namespace: projectName,
          resource: SecretModel.plural,
          verb: 'create',
        }),
      );

      Promise.all(promises).then((accessReviewResults) => {
        const projectsAllowedCreateSecret = accessReviewResults
          .map(
            (accessReview) =>
              accessReview?.status?.allowed && accessReview?.spec?.resourceAttributes?.namespace,
          )
          .filter(Boolean);

        setProjectsWithoutSSHKey(projectsAllowedCreateSecret);
      });
    }
  }, [projects, projectsWithSSHKey, loaded]);

  return { loaded, projectsWithoutSSHKey, projectsWithSSHKey };
};

export default useSSHProjects;
