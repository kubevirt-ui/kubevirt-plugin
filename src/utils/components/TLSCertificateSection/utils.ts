import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sGet } from '@multicluster/k8sRequests';

import { TLS_CERT_CONFIGMAP_KEY, TLS_CERT_SOURCE_EXISTING, TLSCertSourceType } from './constants';

export type TLSCertConfig = {
  cluster?: string;
  tlsCertConfigMapName?: string;
  tlsCertificate?: string;
  tlsCertificateRequired?: boolean;
  tlsCertProject?: string;
  tlsCertSource?: TLSCertSourceType;
};

const createTLSCertConfigMap = async (
  cluster: string,
  namespace: string,
  name: string,
  tlsCertificate: string,
): Promise<string> => {
  const configMap: IoK8sApiCoreV1ConfigMap = {
    apiVersion: 'v1',
    data: { [TLS_CERT_CONFIGMAP_KEY]: tlsCertificate.trim() },
    kind: 'ConfigMap',
    metadata: { name, namespace },
  };
  await kubevirtK8sCreate({
    cluster,
    data: configMap,
    model: ConfigMapModel,
    ns: namespace,
  });
  return name;
};

/**
 * Resolves or creates a TLS certificate ConfigMap for an HTTP DataVolume source.
 * Returns the ConfigMap name for `spec.source.http.certConfigMap`, or undefined if not needed.
 * @param tlsConfig
 * @param targetNamespace
 */
export const getOrCreateTLSCertConfigMapName = async (
  tlsConfig: TLSCertConfig,
  targetNamespace: string,
): Promise<string | undefined> => {
  if (!tlsConfig?.tlsCertificateRequired) return undefined;

  const { cluster, tlsCertConfigMapName, tlsCertificate, tlsCertProject, tlsCertSource } =
    tlsConfig;

  const useExisting = tlsCertSource === TLS_CERT_SOURCE_EXISTING;

  if (useExisting && tlsCertConfigMapName?.trim()) {
    const trimmedName = tlsCertConfigMapName.trim();
    if (tlsCertProject === targetNamespace) {
      return trimmedName;
    }
    const sourceConfigMap = await kubevirtK8sGet<IoK8sApiCoreV1ConfigMap>({
      cluster,
      model: ConfigMapModel,
      name: trimmedName,
      ns: tlsCertProject,
    });
    const certData = sourceConfigMap?.data?.[TLS_CERT_CONFIGMAP_KEY];
    if (!certData) {
      throw new Error(
        `ConfigMap "${trimmedName}" in namespace "${tlsCertProject}" does not contain key "${TLS_CERT_CONFIGMAP_KEY}"`,
      );
    }
    const newName = `tls-cert-${getRandomChars()}`;
    await createTLSCertConfigMap(cluster, targetNamespace, newName, certData);
    return newName;
  }

  if (!useExisting && tlsCertificate?.trim()) {
    const name = `tls-cert-${getRandomChars()}`;
    await createTLSCertConfigMap(cluster, targetNamespace, name, tlsCertificate.trim());
    return name;
  }

  return undefined;
};
