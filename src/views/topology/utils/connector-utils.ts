import i18next from 'i18next';

import {
  DeploymentConfigModel,
  DeploymentModel,
  modelToRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { get, has, pullAt, remove, size } from '@kubevirt-utils/utils/utils';
import {
  k8sGet,
  k8sList,
  k8sPatch,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';

import { K8sResourceKind } from '../../clusteroverview/utils/types';

export type ConnectsToData = { apiVersion: string; kind: string; name: string };

const fetchResource = async (source: string, namespace: string) => {
  const [groupVersionKind, resourceName] = source.split('/');
  const contextualResource: K8sResourceKind = await k8sGet({
    model: getK8sModel(groupVersionKind),
    name: resourceName,
    ns: namespace,
  });
  return contextualResource;
};

export const edgesFromAnnotations = (annotations): (string | ConnectsToData)[] => {
  let edges: (string | ConnectsToData)[] = [];
  if (has(annotations, ['app.openshift.io/connects-to'])) {
    try {
      edges = JSON.parse(annotations['app.openshift.io/connects-to']);
    } catch (e) {
      // connects-to annotation should hold a JSON string value but failed to parse
      // treat value as a comma separated list of strings
      edges = annotations['app.openshift.io/connects-to'].split(',').map((v) => v.trim());
    }
  }

  return edges;
};

export const listInstanceResources = (
  namespace: string,
  instanceName: string,
  labelSelector: any = {},
): Promise<any> => {
  const lists: Promise<any>[] = [];
  const instanceLabelSelector = {
    'app.kubernetes.io/instance': instanceName,
    ...labelSelector,
  };

  const kinds = ['ReplicationController', 'Route', 'Service', 'ReplicaSet', 'BuildConfig', 'Build'];
  kinds?.forEach((kind) => {
    lists.push(
      k8sList({
        model: modelFor(kind),
        queryParams: {
          ns: namespace,
          labelSelector: instanceLabelSelector,
        },
      }).then((values) => {
        return (values as K8sResourceCommon[])?.map((value) => {
          value.kind = kind;
          return value;
        });
      }),
    );
  });

  return Promise.all(lists);
};

// Updates the item to add a new "connects to" value replacing an old value if provided
export const updateItemAppConnectTo = (
  item: K8sResourceKind,
  connections: (string | ConnectsToData)[],
  connectValue: ConnectsToData,
  oldValueIndex: number,
) => {
  const model = modelFor(referenceFor(item) || item.kind);

  if (!model) {
    return Promise.reject(
      new Error(
        i18next.t('kubevirt-plugin~Unable to retrieve model for: {{kind}}', { kind: item.kind }),
      ),
    );
  }

  const tags = Object.entries(item.metadata.annotations);
  let op = size(tags) ? 'replace' : 'add';

  const existingTag = tags?.find((tag) => tag[0] === 'app.openshift.io/connects-to');
  if (existingTag) {
    if (connections.includes(connectValue)) {
      return Promise.resolve();
    }

    if (!connectValue) {
      pullAt(connections, [oldValueIndex]);
    } else if (oldValueIndex >= 0) {
      connections[oldValueIndex] = connectValue;
    } else {
      connections.push(connectValue);
    }
    existingTag[1] = size(connections) && JSON.stringify(connections);

    if (!existingTag[1]) {
      remove(tags, (tag) => tag === existingTag);
      if (!size(tags)) {
        op = 'remove';
      }
    }
  } else {
    if (!connectValue) {
      // Removed connection not found, no need to remove
      return Promise.resolve();
    }

    const connectionTag: [string, string] = [
      'app.openshift.io/connects-to',
      JSON.stringify([connectValue]),
    ];
    tags.push(connectionTag);
  }

  const patch = [{ path: '/metadata/annotations', op, value: Object.fromEntries(tags) }];

  return k8sPatch({ model, resource: item, data: patch });
};

// Get the index of the replaced target of the visual connector
const getReplacedTargetIndex = (
  replacedTarget: K8sResourceKind,
  connections: (string | ConnectsToData)[],
): number => {
  if (replacedTarget) {
    const replaceTargetName = replacedTarget.metadata?.name;
    const replaceTargetKind = replacedTarget.kind;
    const replaceTargetApiVersion = replacedTarget.apiVersion;
    const replaceValue = {
      apiVersion: replaceTargetApiVersion,
      kind: replaceTargetKind,
      name: replaceTargetName,
    };
    const replaceTargetInstanceName =
      replacedTarget.metadata?.labels?.['app.kubernetes.io/instance'];
    let index = connections?.findIndex((connection) => connection === replaceValue);
    if (index === -1) {
      index = connections?.findIndex(
        (connection) => connection === (replaceTargetInstanceName || replaceTargetName),
      );
    }
    return index;
  }
  return -1;
};

// Create a connection from the source to the target replacing the connection to replacedTarget if provided
export const createResourceConnection = (
  source: K8sResourceKind,
  target: K8sResourceKind,
  replacedTarget: K8sResourceKind = null,
): Promise<K8sResourceKind[] | K8sResourceKind> => {
  if (!source || !target || source === target) {
    return Promise.reject();
  }

  const connectTargetName = target.metadata?.name;
  const connectTargetKind = target.kind;
  const connectTargetApiVersion = target.apiVersion;
  const connectValue = {
    apiVersion: connectTargetApiVersion,
    kind: connectTargetKind,
    name: connectTargetName,
  };

  const connections = edgesFromAnnotations(source.metadata?.annotations);

  const replacedTargetIndex = getReplacedTargetIndex(replacedTarget, connections);

  const instanceName = get(source, ['metadata', 'labels', 'app.kubernetes.io/instance']);

  const patches: Promise<K8sResourceKind>[] = [
    updateItemAppConnectTo(source, connections, connectValue, replacedTargetIndex),
  ];

  // If there is no instance label, only update this item
  if (!instanceName) {
    return Promise.all(patches);
  }

  // Update all the instance's resources that were part of the previous application
  return listInstanceResources(source.metadata.namespace, instanceName).then((listsValue) => {
    listsValue?.forEach((list) => {
      list?.forEach((item) => {
        patches.push(updateItemAppConnectTo(item, connections, connectValue, replacedTargetIndex));
      });
    });

    return Promise.all(patches);
  });
};

// Remove the connection from the source to the target
export const removeResourceConnection = (
  source: K8sResourceKind,
  target: K8sResourceKind,
): Promise<any> => {
  if (!source || !target || source === target) {
    return Promise.reject();
  }
  const connections = edgesFromAnnotations(source.metadata?.annotations);

  const replacedTargetIndex = getReplacedTargetIndex(target, connections);

  const instanceName = get(source, ['metadata', 'labels', 'app.kubernetes.io/instance']);

  const patches: Promise<any>[] = [
    updateItemAppConnectTo(source, connections, null, replacedTargetIndex),
  ];

  // If there is no instance label, only update this item
  if (!instanceName) {
    return Promise.all(patches);
  }

  // Update all the instance's resources that were part of the previous application
  return listInstanceResources(source.metadata.namespace, instanceName).then((listsValue) => {
    listsValue?.forEach((list) => {
      list?.forEach((item) => {
        patches.push(updateItemAppConnectTo(item, connections, null, replacedTargetIndex));
      });
    });

    return Promise.all(patches);
  });
};

const getSourceAndTargetForBinding = async (
  resources: K8sResourceKind[] | K8sResourceKind,
  contextualSource: string,
  serviceBindingAvailable?: boolean,
): Promise<{ source: K8sResourceKind; target: K8sResourceKind }> => {
  if (!contextualSource) {
    return Promise.reject(
      new Error(i18next.t('kubevirt-plugin~Cannot do a contextual binding without a source')),
    );
  }
  const linkingModelRefs = [modelToRef(DeploymentConfigModel), modelToRef(DeploymentModel)];
  let target;
  if (serviceBindingAvailable || !Array.isArray(resources)) {
    target = resources;
  } else {
    target = (resources as K8sResourceKind[]).find((resource) =>
      linkingModelRefs.includes(referenceFor(resource)),
    );
  }
  const {
    metadata: { namespace },
  } = target;
  const source: K8sResourceKind = await fetchResource(contextualSource, namespace);
  if (!source) {
    return Promise.reject(
      new Error(
        i18next.t(
          'kubevirt-plugin~Cannot find resource ({{contextualSource}}) to do a contextual binding to',
          {
            contextualSource,
          },
        ),
      ),
    );
  }

  return { source, target };
};

export const doConnectsToBinding = async (
  resources: K8sResourceKind[],
  contextualSource: string,
): Promise<K8sResourceKind[]> => {
  const { source, target } = await getSourceAndTargetForBinding(resources, contextualSource);
  if (!target) {
    // Not a resource we want to connect to
    return resources;
  }
  await createResourceConnection(source, target);

  return resources;
};

export const doContextualBinding = async (
  target: K8sResourceKind,
  contextualSource: string,
): Promise<K8sResourceKind> => {
  const { source } = await getSourceAndTargetForBinding(target, contextualSource, true);
  serviceBindingModal({
    model: modelFor(referenceFor(source)),
    source,
    target,
  });
  return target;
};
