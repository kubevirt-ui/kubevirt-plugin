import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type K8sModel, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { getNamespacePathSegment, isEmpty } from '../../utils/utils';
import { getNamespace } from './metadata';

type ResourceUrlProps = {
  activeNamespace?: string;
  model: K8sModel;
  resource?: K8sResourceCommon;
};

export const getResourceUrl = (urlProps: ResourceUrlProps): string | null => {
  const { activeNamespace, model, resource } = urlProps;

  if (!model) return null;
  const { crd, namespaced, plural } = model;

  const namespace = getNamespace(resource) ?? activeNamespace;
  const namespaceUrl = getNamespacePathSegment(namespace);

  const ref = crd
    ? `${model.apiGroup ?? 'core'}~${model.apiVersion}~${model.kind}`
    : (plural ?? '');
  const name = resource?.metadata?.name ?? '';

  const url = `/k8s/${namespaced ? namespaceUrl : 'cluster'}/${ref}`;

  if (name) {
    return `${url}/${name}`;
  }

  return url;
};

export const getAllowedResources = (
  projectNames: string[],
  model: K8sModel,
): Record<string, unknown> =>
  Object.fromEntries(
    (projectNames ?? []).map((projName) => [
      `${projName}/${model.plural}`,
      {
        groupVersionKind: modelToGroupVersionKind(model),
        isList: true,
        namespace: projName,
        namespaced: true,
      },
    ]),
  );

type AllowedResourceEntry = {
  data: K8sResourceCommon[];
  loaded: boolean;
  loadError?: unknown;
};

export const getAllowedResourceData = (
  resources: Record<string, AllowedResourceEntry>,
  model: K8sModel,
): { data: K8sResourceCommon[]; loaded: boolean; loadError: string } => {
  const resourcesArray = Object.entries(resources)
    .map(([key, watchResult]) => {
      const { data, loaded, loadError } = watchResult;
      if (loaded && key?.includes(model.plural) && !isEmpty(data)) {
        return { data, loaded, loadError };
      }
      return undefined;
    })
    .filter(Boolean);

  const resourceData = (resourcesArray as AllowedResourceEntry[]).flatMap(({ data }) => data);
  const resourceLoaded = (resourcesArray ?? []).every(({ loaded }) => loaded);
  const resourceLoadError = (resourcesArray ?? [])
    .map(({ loadError }) => loadError)
    .filter(Boolean)
    .join('');
  return { data: resourceData, loaded: resourceLoaded, loadError: resourceLoadError };
};
