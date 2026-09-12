import { TemplateModel, VirtualMachineTemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type ExtensionK8sModel, type K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { type ResourceRouteHandler } from '@stolostron/multicluster-sdk';

import { FLEET_BASE_PATH } from '../constants';

import { getFleetTemplatesURL } from './fleetPageUrls';

export type GetFleetResourceRouteProps = (input: {
  cluster: string;
  model: K8sModel;
  name: string;
  namespace: string;
}) => string;

export const getFleetResourceRoute: GetFleetResourceRouteProps = ({
  cluster,
  model,
  name,
  namespace,
}) => {
  if (model.kind === TemplateModel.kind && model.apiGroup === TemplateModel.apiGroup) {
    return `${getFleetTemplatesURL(cluster, namespace)}/${name}`;
  }
  if (
    model.kind === VirtualMachineTemplateModel.kind &&
    model.apiGroup === VirtualMachineTemplateModel.apiGroup
  ) {
    return `${getFleetTemplatesURL(cluster, namespace)}/vmt/${name}`;
  }
  const extensionModel = {
    group: model.apiGroup,
    kind: model.kind,
    version: model.apiVersion,
  } as ExtensionK8sModel;

  return model.namespaced
    ? getFleetNamespacedResourceRoute({
        cluster,
        model: extensionModel,
        name,
        namespace,
        resource: null,
      })
    : getFleetClusterResourceRoute({ cluster, model: extensionModel, name });
};

export const getFleetNamespacedResourceRoute: ResourceRouteHandler = ({
  cluster,
  model,
  name,
  namespace,
}) => {
  const pagePath = getFleetPagePathForModel(model);
  return `${pagePath}/cluster/${cluster}/ns/${namespace}/${name}`;
};

type GetClusterResourceRouteProps = (input: {
  cluster?: string;
  model: ExtensionK8sModel;
  name: string;
}) => string;

export const getFleetClusterResourceRoute: GetClusterResourceRouteProps = ({
  cluster,
  model,
  name,
}) => {
  const pagePath = getFleetPagePathForModel(model);
  return `${pagePath}/cluster/${cluster}/${name}`;
};

export const getClusterResourceRoute: GetClusterResourceRouteProps = ({ cluster, model, name }) => {
  const { group, kind, version } = model;

  return cluster
    ? getFleetClusterResourceRoute({ cluster, model, name })
    : `/k8s/cluster/${group}~${version}~${kind}/${name}`;
};

const getFleetPagePathForModel = (model: ExtensionK8sModel): string =>
  `${FLEET_BASE_PATH}/${model.group}~${model.version}~${model.kind}`;
