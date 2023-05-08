import { k8sCreate, k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { k8sKill } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s';

import { K8sResourceKind } from '../../clusteroverview/utils/types';
import { ExportModel } from '../models';

export const getExportAppData = (name: string, namespace: string) => {
  return {
    apiVersion: `${ExportModel.apiGroup}/${ExportModel.apiVersion}`,
    kind: ExportModel.kind,
    metadata: {
      name,
      namespace,
    },
    spec: {
      method: 'download',
    },
  };
};

export const createExportResource = (res: K8sResourceKind) =>
  k8sCreate({ model: ExportModel, data: res });

export const getExportResource = (name: string, namespace: string) =>
  k8sGet({ model: ExportModel, name: name, ns: namespace });

export const killExportResource = (res: K8sResourceKind) => k8sKill(ExportModel, res);
