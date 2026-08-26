import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1Container,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getCluster } from '@multicluster/helpers/selectors';

const CONFIGMAP_NAME_ENV = 'CONFIGMAP_NAME';

export const getJobContainers = (job?: IoK8sApiBatchV1Job): IoK8sApiCoreV1Container[] =>
  job?.spec?.template?.spec?.containers ?? [];

export const extractConfigMapBaseName = (configMapName: string): string => {
  const baseNameRegex = /^(.+)-\d+-results$/;
  const baseNameMatch = baseNameRegex.exec(configMapName);
  return baseNameMatch ? baseNameMatch[1] : configMapName.replace(/-results$/, '');
};

export const extractConfigMapName = (
  job: IoK8sApiBatchV1Job,
): { cluster?: string; fullName: string; name: string; namespace: string } | null => {
  const containers = getJobContainers(job);
  const envs = containers?.[0]?.env;
  const configMapEnv = envs?.find((env) => env?.name === CONFIGMAP_NAME_ENV);
  const configMapName = configMapEnv?.value;

  if (!configMapName || !job.metadata?.namespace) {
    return null;
  }

  return {
    cluster: getCluster(job),
    fullName: configMapName,
    name: extractConfigMapBaseName(configMapName),
    namespace: job.metadata.namespace,
  };
};

export const getCheckupImageFromNewestJob = (jobs: IoK8sApiBatchV1Job[]): string | undefined => {
  const [newestJob] =
    jobs
      ?.filter((job) => job?.metadata?.creationTimestamp)
      .sort((a, b) =>
        (b.metadata.creationTimestamp ?? '').localeCompare(a.metadata.creationTimestamp ?? ''),
      ) ?? [];
  return getJobContainers(newestJob)?.[0]?.image;
};
