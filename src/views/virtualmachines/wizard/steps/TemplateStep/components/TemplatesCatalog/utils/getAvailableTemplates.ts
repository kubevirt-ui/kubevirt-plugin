import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  ClusterNamespacedResourceMap,
  getResourceFromClusterMap,
} from '@kubevirt-utils/resources/shared';
import { BOOT_SOURCE, Template } from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getCluster } from '@multicluster/helpers/selectors';

const addTemplateIfHasAvailableDataSource = (
  acc: Template[],
  template: Template,
  availableDataSources: object,
): void => {
  const dataSource = getTemplateBootSourceType(template)?.source?.sourceRef;
  const hasMatchingDataSource =
    dataSource?.namespace &&
    dataSource?.name &&
    availableDataSources[`${dataSource.namespace}-${dataSource.name}`];

  if (hasMatchingDataSource) {
    acc.push(template);
  }
};

const addTemplateIfHasAvailablePVC = (
  acc: Template[],
  template: Template,
  availablePVCs: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>,
): void => {
  const pvc = getTemplateBootSourceType(template)?.source?.pvc;
  const hasMatchingPVC =
    pvc?.namespace &&
    pvc?.name &&
    getResourceFromClusterMap(availablePVCs, getCluster(template), pvc.namespace, pvc.name);

  if (hasMatchingPVC) {
    acc.push(template);
  }
};

const addTemplateIfHasOtherBootSource = (acc: Template[], template: Template): void => {
  const hasOtherBootSource = getTemplateBootSourceType(template).type !== BOOT_SOURCE.NONE;

  if (hasOtherBootSource) {
    acc.push(template);
  }
};

export const getAvailableTemplates = (
  availableDataSources: object,
  availablePVCs: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>,
  templates: Template[],
  templatesLoaded: boolean,
): Template[] => {
  const isReady = templatesLoaded && availableDataSources && availablePVCs;

  if (!isReady) return [];

  return templates.reduce((acc, template) => {
    const bootSourceType = getTemplateBootSourceType(template).type;

    if (bootSourceType === BOOT_SOURCE.DATA_SOURCE) {
      addTemplateIfHasAvailableDataSource(acc, template, availableDataSources);
      return acc;
    }

    if (bootSourceType === BOOT_SOURCE.PVC) {
      addTemplateIfHasAvailablePVC(acc, template, availablePVCs);
      return acc;
    }

    addTemplateIfHasOtherBootSource(acc, template);
    return acc;
  }, [] as Template[]);
};
