import cloneDeep from 'lodash.clonedeep';

import { ServiceModel as KnativeServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  BuildConfigModel,
  BuildModel,
  CronJobModel,
  DaemonSetModel,
  DeploymentConfigModel,
  DeploymentModel,
  ImageStreamModel,
  JobModel,
  RouteModel,
  SecretModel,
  ServiceModel,
  StatefulSetModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { checkAccess, K8sKind, k8sList, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { k8sKill } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';

import { K8sResourceKind } from '../../clusteroverview/utils/types';
import { detectGitType } from '../components/graph-view/components/router-decorator-icon/utils/utils';
import { CREATE_APPLICATION_KEY, UNASSIGNED_KEY } from '../const';

import { getBuildConfigsForResource } from './hooks/useBuildsConfigWatcher/utils/utils';
import { listInstanceResources } from './connector-utils';
import { isDynamicEventResourceKind } from './fetch-dynamic-eventsources-utils';
import { CamelKameletBindingModel, EventingBrokerModel, KafkaSinkModel } from './knative-models';
import { fetchChannelsCRD } from './knative-topology-utils';

export const sanitizeApplicationValue = (
  application: string,
  applicationType: string = application,
): string => {
  switch (applicationType) {
    case UNASSIGNED_KEY:
    case CREATE_APPLICATION_KEY:
      return '';
    default:
      return application;
  }
};

// Updates the resource's labels to set its application grouping
const updateItemAppLabel = (
  resourceKind: K8sKind,
  item: K8sResourceKind,
  application: string,
): Promise<any> => {
  const labels = { ...item.metadata.labels, 'app.kubernetes.io/part-of': application || undefined };

  if (!resourceKind) {
    return Promise.reject();
  }

  const patch = [
    {
      op: isEmpty(labels) ? 'add' : 'replace',
      path: '/metadata/labels',
      value: labels,
    },
  ];

  return k8sPatch({ model: resourceKind, resource: item, data: patch });
};

// Updates the given resource and its associated resources to the given application grouping
export const updateResourceApplication = (
  resourceKind: K8sKind,
  resource: K8sResourceKind,
  application: string,
): Promise<any> => {
  if (!resource) {
    return Promise.reject(new Error(t('Error: no resource provided to update application for.')));
  }
  if (!resourceKind) {
    return Promise.reject(
      new Error(t('Error: invalid resource kind provided for updating application.')),
    );
  }

  const instanceName = resource?.metadata?.labels?.['app.kubernetes.io/instance'];
  const prevApplication = resource?.metadata?.labels?.['app.kubernetes.io/part-of'];

  const patches: Promise<any>[] = [updateItemAppLabel(resourceKind, resource, application)];

  // If there is no instance label, only update this item
  if (!instanceName) {
    return Promise.all(patches);
  }

  // selector is for the instance name and current application if there is one
  const labelSelector = {
    'app.kubernetes.io/instance': instanceName,
  };
  if (prevApplication) {
    labelSelector['app.kubernetes.io/part-of'] = prevApplication;
  }

  // Update all the instance's resources that were part of the previous application
  return listInstanceResources(resource.metadata.namespace, instanceName, {
    'app.kubernetes.io/part-of': prevApplication,
  }).then((listsValue) => {
    listsValue?.forEach((list) => {
      list?.forEach((item) => {
        // verify the case of no previous application
        if (prevApplication || !item?.metadata?.labels?.['app.kubernetes.io/part-of']) {
          patches.push(updateItemAppLabel(getK8sModel(item.kind), item, application));
        }
      });
    });

    return Promise.all(patches);
  });
};

const safeKill = async (model: K8sKind, obj: K8sResourceKind) => {
  const resp = await checkAccess({
    group: model.apiGroup,
    resource: model.plural,
    verb: 'delete',
    name: obj.metadata.name,
    namespace: obj.metadata.namespace,
  });
  if (resp.status.allowed) {
    try {
      return await k8sKill(model, obj);
    } catch (error) {
      // 404 when resource is not found
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }
  return null;
};

const deleteWebhooks = async (resource: K8sResourceKind, buildConfigs: K8sResourceKind[]) => {
  const deploymentsAnnotations = resource.metadata?.annotations ?? {};
  const gitType = detectGitType(deploymentsAnnotations['app.openshift.io/vcs-uri']);
  const secretList = await k8sList({
    model: SecretModel,
    queryParams: {
      ns: resource.metadata.namespace,
    },
  });
  return buildConfigs?.reduce((requests, bc) => {
    const triggers = bc.spec?.triggers ?? [];
    const reqs = triggers.reduce((acc, trigger) => {
      let secretResource: K8sResourceKind;
      const webhookType = trigger.generic ? 'generic' : gitType;
      const webhookTypeObj = trigger.generic || trigger[gitType];
      if (webhookTypeObj) {
        const secretName =
          webhookTypeObj.secretReference?.name ??
          `${resource.metadata.name}-${webhookType}-webhook-secret`;
        secretResource = (Array.isArray(secretList) ? secretList : [])?.find(
          (secret: K8sResourceKind) => secret.metadata.name === secretName,
        );
      }
      return secretResource ? [...acc, safeKill(SecretModel, secretResource)] : acc;
    }, []);
    return [...requests, ...reqs];
  }, []);
};

export const cleanUpWorkload = async (resource: K8sResourceKind): Promise<K8sResourceKind[]> => {
  const reqs = [];
  const buildConfigs = await k8sList({
    model: BuildConfigModel,
    queryParams: {
      ns: resource.metadata.namespace,
    },
  });
  const builds = await k8sList({
    model: BuildModel,
    queryParams: {
      ns: resource.metadata.namespace,
    },
  });
  const channelModels = await fetchChannelsCRD();
  const resourceModel = modelFor(referenceFor(resource));
  const resources = {
    buildConfigs: {
      data: buildConfigs,
      loaded: true,
      loadError: null,
    },
    builds: {
      data: builds,
      loaded: true,
      loadError: null,
    },
  };
  const resourceBuildConfigs = getBuildConfigsForResource(resource, resources);
  const isBuildConfigPresent = !isEmpty(resourceBuildConfigs);

  const deleteModels = [ServiceModel, RouteModel, ImageStreamModel];
  const knativeDeleteModels = [KnativeServiceModel, ImageStreamModel];
  const resourceData = cloneDeep(resource);
  const deleteRequest = (model: K8sKind, resourceObj: K8sResourceKind) => {
    const req = safeKill(model, resourceObj);
    req && reqs.push(req);
  };
  if (isBuildConfigPresent) {
    resourceBuildConfigs.forEach((bc) => {
      deleteRequest(BuildConfigModel, bc);
    });
  }
  const batchDeleteRequests = (models: K8sKind[], resourceObj: K8sResourceKind): void => {
    models.forEach((model) => deleteRequest(model, resourceObj));
  };
  if (isDynamicEventResourceKind(referenceFor(resource)))
    deleteRequest(modelFor(referenceFor(resource)), resource);
  if (channelModels.find((channel) => channel.kind === resource.kind)) {
    deleteRequest(resourceModel, resource);
  }
  switch (resource.kind) {
    case DaemonSetModel.kind:
    case StatefulSetModel.kind:
    case JobModel.kind:
    case CronJobModel.kind:
    case EventingBrokerModel.kind:
      deleteRequest(resourceModel, resource);
      break;
    case DeploymentModel.kind:
    case DeploymentConfigModel.kind:
      deleteRequest(resourceModel, resource);
      batchDeleteRequests(deleteModels, resource);
      break;
    case KnativeServiceModel.kind:
      batchDeleteRequests(knativeDeleteModels, resourceData);
      break;
    case CamelKameletBindingModel.kind:
    case KafkaSinkModel.kind:
      deleteRequest(resourceModel, resource);
      break;
    default:
      break;
  }
  isBuildConfigPresent && reqs.push(...(await deleteWebhooks(resource, resourceBuildConfigs)));
  return Promise.all(reqs);
};
