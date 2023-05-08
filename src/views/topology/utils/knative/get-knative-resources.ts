import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { get } from '@kubevirt-utils/utils/utils';

import { K8sResourceKind } from '../../../clusteroverview/utils/types';
import { KnativeItem } from '../types/knativeTypes';

import { KNATIVE_SERVING_LABEL } from './knative-const';

const isKnativeDeployment = (dc: K8sResourceKind) => {
  return !!get(dc.metadata, `labels["${KNATIVE_SERVING_LABEL}"]`);
};

const getKsResource = (dc: K8sResourceKind, { data }: K8sResourceKind): K8sResourceKind[] => {
  let ksResource = [];
  if (isKnativeDeployment(dc)) {
    const name = dc.metadata.labels?.[KNATIVE_SERVING_LABEL];
    ksResource = data?.filter((config: K8sResourceKind) => {
      return name === get(config, 'metadata.name');
    });
  }
  return ksResource;
};

const getRevisions = (dc: K8sResourceKind, { data }): K8sResourceKind[] => {
  let revisionResource = [];
  if (isKnativeDeployment(dc)) {
    const ownerUid = dc.metadata.ownerReferences?.[0]?.uid;
    revisionResource = data?.filter((revision: K8sResourceKind) => {
      return ownerUid && ownerUid === revision.metadata.uid;
    });
  }
  return revisionResource;
};

export const getDomainMapping = (res: K8sResourceKind, { data }): K8sResourceKind[] => {
  const { apiVersion, kind, metadata } = res;
  let domainMappingResource = [];
  if (!metadata || !data.length) return domainMappingResource;
  if (
    kind === ServiceModel.kind &&
    apiVersion === `${ServiceModel.apiGroup}/${ServiceModel.apiVersion}`
  ) {
    domainMappingResource = data.filter((domainMapping) => {
      return (
        domainMapping.spec.ref.apiVersion === apiVersion &&
        domainMapping.spec.ref.kind === kind &&
        domainMapping.spec.ref.name === metadata.name
      );
    });
  }
  return domainMappingResource;
};

export const getKnativeServingRevisions = (dc: K8sResourceKind, props): KnativeItem | undefined => {
  const revisions = props && props.revisions && getRevisions(dc, props.revisions);
  return revisions && revisions.length > 0 ? { revisions } : undefined;
};

export const getKnativeServingConfigurations = (
  dc: K8sResourceKind,
  props,
): KnativeItem | undefined => {
  const configurations = props && props.configurations && getKsResource(dc, props.configurations);
  return configurations && configurations.length > 0 ? { configurations } : undefined;
};

export const getKnativeServingRoutes = (dc: K8sResourceKind, props): KnativeItem | undefined => {
  const ksroutes = props && props.ksroutes && getKsResource(dc, props.ksroutes);
  return ksroutes && ksroutes.length > 0 ? { ksroutes } : undefined;
};

export const getKnativeServingDomainMapping = (res: K8sResourceKind, props) => {
  const domainMappings =
    props && props.domainmappings && getDomainMapping(res, props.domainmappings);
  return domainMappings?.length > 0 ? { domainMappings } : undefined;
};

export const getKnativeServingServices = (dc: K8sResourceKind, props): KnativeItem | undefined => {
  const ksservices = props && props.ksservices && getKsResource(dc, props.ksservices);
  return ksservices && ksservices.length > 0 ? { ksservices } : undefined;
};
