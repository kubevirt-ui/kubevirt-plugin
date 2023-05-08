import unionWith from 'lodash.unionwith';

import { JobModel } from '@kubevirt-ui/kubevirt-api/console';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { getAPIVersionForModel } from '@openshift-console/dynamic-plugin-sdk';
import { BuildConfigOverviewItem } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';

import { K8sResourceKind } from '../../../../../clusteroverview/utils/types';

import { BUILD_NUMBER_ANNOTATION, TRIGGERS_ANNOTATION } from './const';
import { CronJobKind, JobKind } from './types';

// FIXME use parseJSONAnnotation helper
const getAnnotatedTriggers = (obj: K8sResourceKind) => {
  const triggersJSON = getAnnotation(obj, TRIGGERS_ANNOTATION) || '[]';
  try {
    return JSON.parse(triggersJSON);
  } catch (e) {
    /* eslint-disable-next-line no-console */
    console.error('Error parsing triggers annotation', e);
    return [];
  }
};

export const getJobsForCronJob = (cronJobUid: string, resources: any): JobKind[] => {
  if (!resources?.jobs?.data?.length) {
    return [];
  }
  return resources.jobs.data
    .filter((job) => job.metadata?.ownerReferences?.find((ref) => ref.uid === cronJobUid))
    .map((job) => ({
      ...job,
      apiVersion: getAPIVersionForModel(JobModel),
      kind: JobModel.kind,
    }));
};

export const getOwnedResources = <T extends K8sResourceKind>(
  obj: K8sResourceKind,
  resources: T[],
): T[] => {
  const uid = obj?.metadata?.uid;
  if (!uid) {
    return [];
  }
  return resources?.filter(({ metadata: { ownerReferences } }) => {
    return ownerReferences.some((ownerRef) => ownerRef?.uid === uid && ownerRef?.controller);
  });
};

export const getBuildsForResource = (
  buildConfig: K8sResourceKind,
  resources: any,
): K8sResourceKind[] => {
  const { builds } = resources;
  return getOwnedResources(buildConfig, builds.data);
};

export const getBuildNumber = (build) => {
  const buildNumber = build?.metadata?.annotations || BUILD_NUMBER_ANNOTATION;
  return !!buildNumber && parseInt(buildNumber, 10);
};

export const sortBuilds = (builds: K8sResourceKind[]): K8sResourceKind[] => {
  const byCreationTime = (left, right) => {
    const leftCreationTime = new Date(left?.metadata?.creationTimestamp || Date.now());
    const rightCreationTime = new Date(right?.metadata?.creationTimestamp || Date.now());
    return rightCreationTime.getMilliseconds() - leftCreationTime.getMilliseconds();
  };

  const byBuildNumber = (left, right) => {
    const leftBuildNumber = getBuildNumber(left);
    const rightBuildNumber = getBuildNumber(right);
    if (!Number.isFinite(leftBuildNumber) || !Number.isFinite(rightBuildNumber)) {
      return byCreationTime(left, right);
    }
    return rightBuildNumber - leftBuildNumber;
  };

  return [...builds].sort(byBuildNumber);
};

export const getBuildConfigsForCronJob = (
  cronJob: CronJobKind,
  resources: any,
): BuildConfigOverviewItem[] => {
  const buildConfigs = resources?.buildConfigs?.data ?? [];
  const currentNamespace = cronJob.metadata.namespace;
  const containers = cronJob.spec?.jobTemplate?.spec?.template?.spec?.containers ?? [];
  return buildConfigs.reduce((acc, buildConfig) => {
    const targetImageNamespace = buildConfig?.spec?.output?.to?.namespace ?? currentNamespace;
    const targetImageName = buildConfig?.spec?.output?.to?.name;
    if (
      currentNamespace === targetImageNamespace &&
      containers.find((container) => container.image?.endsWith(targetImageName))
    ) {
      const builds = getBuildsForResource(buildConfig, resources);
      return [
        ...acc,
        {
          ...buildConfig,
          builds: sortBuilds(builds),
        },
      ];
    }
    return acc;
  }, []);
};

export const getBuildConfigsForResource = (
  resource: K8sResourceKind,
  resources: any,
): BuildConfigOverviewItem[] => {
  if (resource.kind === 'CronJob') {
    return getBuildConfigsForCronJob(resource as CronJobKind, resources);
  }
  const NAME_LABEL = 'app.kubernetes.io/name';
  const buildConfigs = resources?.buildConfigs?.data;
  const currentNamespace = resource.metadata.namespace;
  const nativeTriggers = resource?.spec?.triggers;
  const annotatedTriggers = getAnnotatedTriggers(resource);
  const triggers = unionWith(nativeTriggers, annotatedTriggers, isEqualObject);
  const resourceNameLabel = resource.metadata?.labels?.[NAME_LABEL];
  return triggers.flatMap((trigger) => {
    const triggerFrom = trigger.from || (trigger.imageChangeParams?.from ?? {});
    if (triggerFrom.kind !== 'ImageStreamTag') {
      return [];
    }
    const triggerImageNamespace = triggerFrom.namespace || currentNamespace;
    const triggerImageName = triggerFrom.name;
    return buildConfigs.reduce((acc, buildConfig) => {
      const targetImageNamespace = buildConfig.spec?.output?.to?.namespace ?? currentNamespace;
      const targetImageName = buildConfig.spec?.output?.to?.name;
      if (
        triggerImageNamespace === targetImageNamespace &&
        (triggerImageName === targetImageName ||
          (!!resourceNameLabel && resourceNameLabel === buildConfig.metadata?.labels?.[NAME_LABEL]))
      ) {
        const builds = getBuildsForResource(buildConfig, resources);
        return [
          ...acc,
          {
            ...buildConfig,
            builds: sortBuilds(builds),
          },
        ];
      }
      return acc;
    }, []);
  });
};
