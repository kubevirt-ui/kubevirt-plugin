import { type ResourceOptions } from '@kubevirt-utils/hooks/useResourceEvents/utils/types';
import { getKind, getName, getUID } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { k8sBasePath } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/k8s';

const getK8sAPIPath = ({ apiGroup = 'core', apiVersion }: K8sModel): string => {
  const isLegacy = apiGroup === 'core' && apiVersion === 'v1';
  let path = isLegacy ? '/api/' : '/apis/';

  if (!isLegacy && apiGroup) {
    path += `${apiGroup}/`;
  }

  path += apiVersion;
  return path;
};

const getK8sResourcePath = (model: K8sModel, options: ResourceOptions): string => {
  let url = getK8sAPIPath(model);

  if (model.namespaced && options.ns) {
    url += `/namespaces/${options.ns}`;
  }
  url += `/${model.plural}`;
  if (options.name) {
    url += `/${encodeURIComponent(options.name)}`;
  }
  if (options.path) {
    url += `/${options.path}`;
  }
  if (!isEmpty(options.queryParams)) {
    const query = Object.entries(options.queryParams).map(([key, value]) => `${key}=${value}`);
    url += `?${query.join('&')}`;
  }

  return url;
};

const resourceURL = (model: K8sModel, options: ResourceOptions): string =>
  `${k8sBasePath}${getK8sResourcePath(model, options)}`;

export const watchURL = (kind: K8sModel, options: ResourceOptions): string => {
  const opts: ResourceOptions = {
    ...(options ?? {}),
    queryParams: {
      ...(options?.queryParams ?? {}),
      watch: 'true',
    },
  };

  opts.queryParams = opts.queryParams ?? {};
  opts.queryParams.watch = 'true';
  return resourceURL(kind, opts);
};

export const getFieldSelector = (obj: K8sResourceCommon): string =>
  `involvedObject.uid=${getUID(obj)},involvedObject.name=${getName(
    obj,
  )},involvedObject.kind=${getKind(obj)}`;
