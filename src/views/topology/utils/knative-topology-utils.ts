import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  consoleFetch,
  getGroupVersionKindForResource,
  k8sUpdate,
} from '@openshift-console/dynamic-plugin-sdk';
import { TopologyDataResources } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';
import { chart_color_red_300 as knativeEventingColor } from '@patternfly/react-tokens/dist/js/chart_color_red_300';
import { Node } from '@patternfly/react-topology/dist/esm/types';

import { K8sResourceKind } from '../../clusteroverview/utils/types';
import { URI_KIND } from '../const';

import {
  CAMEL_SOURCE_INTEGRATION,
  SERVERLESS_FUNCTION_LABEL,
  SERVERLESS_FUNCTION_LABEL_DEPRECATED,
} from './knative/knative-const';
import { EventSourceData } from './types/knativeTypes';
import { getPluralLabel, kindToAbbr } from './common-utils';
import isMultiClusterEnabled from './isMultiClusterEnabled';
import { getLatestVersionForCRD } from './k8s-utils';
import { getResource } from './topology-utils';

export const getKameletSinkAndSourceBindings = (resources) => {
  const camelKameletBindingResources: K8sResourceKind[] = resources?.kameletbindings?.data ?? [];
  const camelKameletResources: K8sResourceKind[] =
    resources?.kamelets?.data?.length > 0
      ? resources.kamelets.data
      : resources?.kameletGlobalNS?.data ?? [];
  const sinkCamelKameletResources: K8sResourceKind[] = camelKameletResources.filter(
    (camelKamelet) => camelKamelet.metadata.labels['camel.apache.org/kamelet.type'] === 'sink',
  );
  return camelKameletBindingResources.reduce(
    ({ camelSinkKameletBindings: sink, camelSourceKameletBindings: source }, binding) => {
      const sinkResource = binding?.spec?.sink?.ref?.name;
      sinkCamelKameletResources.findIndex(
        (kameletSink) => kameletSink.metadata.name === sinkResource,
      ) > -1
        ? sink.push(binding)
        : source.push(binding);
      return { camelSinkKameletBindings: sink, camelSourceKameletBindings: source };
    },
    { camelSinkKameletBindings: [], camelSourceKameletBindings: [] },
  );
};

export const getKnativeDynamicResources = (
  resources: TopologyDataResources,
  dynamicProps: string[],
): K8sResourceKind[] => {
  return dynamicProps.reduce((acc, currProp) => {
    const currPropResource = resources[currProp]?.data ?? [];
    return [...acc, ...currPropResource];
  }, []);
};

export const isOperatorBackedKnSinkService = (
  obj: K8sResourceKind,
  knEventSinks: K8sResourceKind[],
) => {
  return !!knEventSinks?.find((evsrc) =>
    obj.metadata?.labels?.[CAMEL_SOURCE_INTEGRATION]?.startsWith(evsrc.metadata.name),
  );
};

export const createEventSourceKafkaConnection = (
  source: Node,
  target: Node,
): Promise<K8sResourceKind> => {
  if (!source || !target || source === target) {
    return Promise.reject();
  }
  const sourceObj = getResource(source);
  const targetObj = getResource(target);
  const mkcBoostrapServer = targetObj?.status?.bootstrapServerHost;
  const mkcServiceAccountSecretName = targetObj?.spec?.credentials?.serviceAccountSecretName;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { status, ...otherSourceObjProperties } = sourceObj;
  const knKafkaSourceObj = otherSourceObjProperties;

  if (!mkcBoostrapServer || !mkcServiceAccountSecretName) {
    return Promise.reject(
      new Error(
        t(
          'Unable to create kafka connector as bootstrapServerHost or secret is not available in target resource.',
        ),
      ),
    );
  }

  const updatedObjPayload = {
    ...knKafkaSourceObj,
    spec: {
      ...knKafkaSourceObj.spec,
      bootstrapServers: [mkcBoostrapServer],
      net: {
        sasl: {
          enable: true,
          user: { secretKeyRef: { name: mkcServiceAccountSecretName, key: 'client-id' } },
          password: { secretKeyRef: { name: mkcServiceAccountSecretName, key: 'client-secret' } },
        },
        tls: { enable: true },
      },
    },
  };
  return k8sUpdate({
    model: getK8sModel(getGroupVersionKindForResource(knKafkaSourceObj)),
    data: updatedObjPayload,
  });
};

export const createKnativeEventSourceSink = (
  source: K8sResourceKind,
  target: K8sResourceKind,
): Promise<K8sResourceKind> => {
  if (!source || !target || source === target) {
    return Promise.reject();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { status, ...otherSourceProps } = source;
  const eventSourceObj = otherSourceProps;
  let sink = {};
  if (target.kind === URI_KIND) {
    sink = {
      uri: target?.spec?.sinkUri,
    };
  } else {
    const targetName = target?.metadata?.name;
    sink = {
      ref: {
        apiVersion: target.apiVersion,
        kind: target.kind,
        name: targetName,
      },
    };
  }
  const updatePayload = {
    ...eventSourceObj,
    spec: { ...eventSourceObj.spec, sink },
  };
  return k8sUpdate({ model: getK8sModel(source), data: updatePayload });
};

export const createSinkConnection = (source: Node, target: Node): Promise<K8sResourceKind> => {
  if (!source || !target || source === target) {
    return Promise.reject();
  }
  const sourceObj = getResource(source);
  const targetObj = getResource(target);

  return createKnativeEventSourceSink(sourceObj, targetObj);
};

export const isServerlessFunction = (element: K8sResourceKind): boolean => {
  if (!element) {
    return false;
  }
  const {
    metadata: { labels },
  } = element;

  // TODO: remove check for the deprecated label for serverless function
  return !!(labels?.[SERVERLESS_FUNCTION_LABEL] || labels?.[SERVERLESS_FUNCTION_LABEL_DEPRECATED]);
};

export const eventSourceData: EventSourceData = {
  loaded: false,
  eventSourceModels: [],
  eventSourceChannels: [],
};

export const fetchChannelsCRD = async () => {
  if (isMultiClusterEnabled()) {
    eventSourceData.eventSourceChannels = [];
    return eventSourceData.eventSourceChannels;
  }
  const url = 'api/console/knative-channels';
  try {
    const res = await consoleFetch(url);
    const resolvedRes = await res.json();

    const allChannelModels = resolvedRes?.items?.filter((accumulator, crd) => {
      const {
        spec: {
          group,
          names: { kind, plural, singular },
        },
      } = crd;
      const crdLatestVersion = getLatestVersionForCRD(crd);
      const labelPlural = getPluralLabel(kind, plural);
      const sourceModel = {
        apiGroup: group,
        apiVersion: crdLatestVersion,
        kind,
        plural,
        id: singular,
        label: kind,
        labelPlural,
        abbr: kindToAbbr(kind),
        namespaced: true,
        crd: true,
        color: knativeEventingColor.value,
      };
      accumulator.push(sourceModel);
      return accumulator;
    }, []);

    eventSourceData.eventSourceChannels = allChannelModels;
  } catch {
    eventSourceData.eventSourceChannels = [];
  }
  return eventSourceData.eventSourceChannels;
};
