import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';
import type * as k8s from '@kubernetes/client-node';
import { setHeaderOptions } from '@kubernetes/client-node';

import { getKubernetesProxyUrl, makeKubernetesProxyRequest } from '../kubernetes-proxy';

import type { KubernetesHandlerContext } from './kubernetes-api-context';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getHttpStatusCode(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;
  const direct = error['statusCode'];
  if (typeof direct === 'number') return direct;
  const response = error['response'];
  if (isRecord(response) && typeof response['statusCode'] === 'number') {
    return response['statusCode'];
  }
  return undefined;
}

function getKubernetesErrorBodyCode(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;
  const body = error['body'];
  if (isRecord(body) && typeof body['code'] === 'number') return body['code'];
  return undefined;
}

function getKubernetesPatchErrorMessage(error: unknown): string {
  if (!isRecord(error)) return getErrorMessage(error);
  const response = error['response'];
  if (isRecord(response)) {
    const rspBody = response['body'];
    if (isRecord(rspBody) && typeof rspBody['message'] === 'string') return rspBody['message'];
    if (typeof rspBody === 'string') return rspBody;
  }
  const body = error['body'];
  if (isRecord(body) && typeof body['message'] === 'string') return body['message'];
  if (typeof error['message'] === 'string') return error['message'];
  return getErrorMessage(error);
}

const DEFAULT_UNATTEND_XML = `<?xml version="1.0" encoding="utf-8"?>
<unattend xmlns="urn:schemas-microsoft-com:unattend">
  <settings pass="windowsPE">
    <component name="Microsoft-Windows-International-Core-WinPE" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <SetupUILanguage>
        <UILanguage>en-US</UILanguage>
      </SetupUILanguage>
      <InputLocale>en-US</InputLocale>
      <SystemLocale>en-US</SystemLocale>
      <UILanguage>en-US</UILanguage>
      <UserLocale>en-US</UserLocale>
    </component>
  </settings>
  <settings pass="specialize">
    <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <ComputerName>*</ComputerName>
    </component>
  </settings>
  <settings pass="oobeSystem">
    <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <OOBE>
        <HideEULAPage>true</HideEULAPage>
        <HideLocalAccountScreen>true</HideLocalAccountScreen>
        <HideOnlineAccountScreens>true</HideOnlineAccountScreens>
        <HideWirelessSetupInOOBE>true</HideWirelessSetupInOOBE>
        <ProtectYourPC>3</ProtectYourPC>
      </OOBE>
      <UserAccounts>
        <AdministratorPassword>
          <Value>cnv-tester</Value>
          <PlainText>true</PlainText>
        </AdministratorPassword>
      </UserAccounts>
    </component>
  </settings>
</unattend>`;

const DEFAULT_SSH_PUBLIC_KEY =
  'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDRqNQn0gB3KyEDXQVSTmJYDxm5q3NcNqcxC9EqW0YqXa3M5FMzP7qLFWELRLbDgHmlb0nvBWD3TbQjGmJTvBMxl5HBaEFf3AQAIWWxnYrZvMz6kc2IzGzMz5n5j5n5k5n5m5n5o5n5p5n5q5n5r5n5s5n5t5n5u5n5v5n5w5n5x5n5y5n5z5n5AAAA test-key@playwright';

export class SecretConfigMapHandler {
  constructor(private readonly ctx: KubernetesHandlerContext) {}

  async createSecret(
    name: string,
    namespace: string,
    data: { [key: string]: string },
    type = 'Opaque',
  ): Promise<k8s.V1Secret> {
    try {
      const currentContext = this.ctx.kc.getCurrentContext();
      if (!currentContext) {
        throw new Error(
          'No Kubernetes context is set. Authentication may not be configured properly.',
        );
      }

      const context = this.ctx.kc.getContextObject(currentContext);
      if (!context || !context.user) {
        throw new Error(
          `Context '${currentContext}' does not have a user configured. Authentication may not be set up correctly.`,
        );
      }

      const user = this.ctx.kc.getUser(context.user);
      if (!user) {
        throw new Error(
          `User '${context.user}' from context '${currentContext}' not found in kubeconfig.`,
        );
      }

      if (user.username && user.password && !user.token) {
        throw new Error(
          'Authentication configured with username/password but no token. ' +
            'Username/password authentication does not work directly with Kubernetes API. ' +
            'Please ensure a kubeconfig file (created via oc login) or token is provided.',
        );
      }

      if (!user.token) {
        throw new Error(
          'No authentication token found. ' +
            'The Kubernetes API requires a token for authentication. ' +
            'Please ensure a kubeconfig file (created via oc login) or token is provided.',
        );
      }

      const secret: k8s.V1Secret = {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: name,
          namespace: namespace,
        },
        type: type,
        data: {},
      };

      if (!secret.data) secret.data = {};
      for (const [key, value] of Object.entries(data)) {
        secret.data[key] = Buffer.from(value).toString('base64');
      }

      const response = await this.ctx.coreV1Api.createNamespacedSecret({
        namespace,
        body: secret,
      });
      return response;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      const errorBody =
        isRecord(error) && error['body'] !== undefined
          ? JSON.stringify(error['body'], null, 2)
          : '';
      const httpCode = getHttpStatusCode(error);
      const errorStatus = httpCode !== undefined ? `HTTP-Code: ${httpCode}` : '';
      let errorResponse = '';
      let responseHeadersJson = '';
      if (isRecord(error)) {
        const rawResponse = error['response'];
        if (rawResponse !== undefined) {
          errorResponse = JSON.stringify(rawResponse, null, 2);
          if (
            isRecord(rawResponse) &&
            rawResponse['headers'] !== undefined &&
            rawResponse['headers'] !== null
          ) {
            responseHeadersJson = JSON.stringify(rawResponse['headers'], null, 2);
          }
        }
      }

      let detailedError = `Failed to create secret ${name} in namespace ${namespace}`;
      if (errorStatus) {
        detailedError += `\n    ${errorStatus}`;
      }
      if (errorMessage && errorMessage !== errorStatus) {
        detailedError += `\n    Message: ${errorMessage}`;
      }
      if (errorBody) {
        detailedError += `\n    Body: ${errorBody}`;
      }
      if (errorResponse && errorResponse !== errorBody) {
        detailedError += `\n    Response: ${errorResponse}`;
      }
      if (responseHeadersJson) {
        detailedError += `\n    Headers: ${responseHeadersJson}`;
      }

      throw new Error(detailedError);
    }
  }

  async createSysprepConfigMap(
    name: string,
    namespace: string,
    unattendXml?: string,
  ): Promise<k8s.V1ConfigMap> {
    try {
      const configMap: k8s.V1ConfigMap = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: name,
          namespace: namespace,
        },
        data: {
          'autounattend.xml': unattendXml || DEFAULT_UNATTEND_XML,
        },
      };

      const response = await this.ctx.coreV1Api.createNamespacedConfigMap({
        namespace,
        body: configMap,
      });
      return response;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      const httpCode = getHttpStatusCode(error);
      const errorStatus = httpCode !== undefined ? `HTTP-Code: ${httpCode}` : '';
      throw new Error(
        `Failed to create sysprep ConfigMap ${name} in namespace ${namespace}: ${errorStatus} ${errorMessage}`,
      );
    }
  }

  async createTlsCaCertConfigMap(
    name: string,
    namespace: string,
    caPem: string,
  ): Promise<k8s.V1ConfigMap> {
    try {
      const configMap: k8s.V1ConfigMap = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name,
          namespace,
        },
        data: {
          'ca.pem': caPem,
        },
      };

      const response = await this.ctx.coreV1Api.createNamespacedConfigMap({
        namespace,
        body: configMap,
      });
      return response;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      const httpCode = getHttpStatusCode(error);
      const errorStatus = httpCode !== undefined ? `HTTP-Code: ${httpCode}` : '';
      throw new Error(
        `Failed to create TLS CA ConfigMap ${name} in namespace ${namespace}: ${errorStatus} ${errorMessage}`,
      );
    }
  }

  async verifySecretExists(
    name: string,
    namespace: string,
    timeout: number = TestTimeouts.CLUSTER_OPERATION,
  ): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        const response = await this.ctx.coreV1Api.readNamespacedSecret({
          name,
          namespace,
        });
        return !!response;
      } catch (error: unknown) {
        if (getHttpStatusCode(error) === 404) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        return false;
      }
    }
    return false;
  }

  async createSSHKeySecret(
    name: string,
    namespace: string,
    sshPublicKey?: string,
  ): Promise<k8s.V1Secret> {
    try {
      const secretData = {
        key: sshPublicKey || DEFAULT_SSH_PUBLIC_KEY,
      };

      return await this.createSecret(name, namespace, secretData, 'Opaque');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      throw new Error(
        `Failed to create SSH key secret ${name} in namespace ${namespace}: ${errorMessage}`,
      );
    }
  }

  async verifySysprepConfigMapExists(
    name: string,
    namespace: string,
    timeout: number = TestTimeouts.CLUSTER_OPERATION,
  ): Promise<{ exists: boolean; hasAutounattend?: boolean; data?: Record<string, string> }> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        const configMap = await this.ctx.coreV1Api.readNamespacedConfigMap({
          name,
          namespace,
        });

        if (configMap) {
          const data = configMap.data || {};
          const hasAutounattend = !!(
            data['autounattend.xml'] ||
            data['unattend.xml'] ||
            data['Autounattend.xml'] ||
            data['Unattend.xml']
          );
          return {
            exists: true,
            hasAutounattend,
            data,
          };
        }
        return { exists: false };
      } catch (error: unknown) {
        if (getHttpStatusCode(error) === 404) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        return { exists: false };
      }
    }
    return { exists: false };
  }

  async getConfigMap(name: string, namespace: string): Promise<KubernetesResource | null> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      try {
        return (await makeKubernetesProxyRequest(
          this.ctx.kc,
          'GET',
          `/api/v1/namespaces/${namespace}/configmaps/${name}`,
        )) as KubernetesResource;
      } catch (error: unknown) {
        if (getErrorMessage(error).includes('404')) {
          return null;
        }
        throw error;
      }
    }

    try {
      const response = await this.ctx.coreV1Api.readNamespacedConfigMap({
        name,
        namespace,
      });
      return response as unknown as KubernetesResource;
    } catch (error: unknown) {
      if (getHttpStatusCode(error) === 404) {
        return null;
      }
      throw error;
    }
  }

  async patchConfigMap(
    name: string,
    namespace: string,
    patchData: Record<string, string>,
  ): Promise<k8s.V1ConfigMap> {
    const proxyUrl = getKubernetesProxyUrl();

    if (!proxyUrl) {
      try {
        const existingConfigMap = await this.getConfigMap(name, namespace);

        if (!existingConfigMap) {
          const newConfigMap: k8s.V1ConfigMap = {
            apiVersion: 'v1',
            kind: 'ConfigMap',
            metadata: {
              name,
              namespace,
            },
            data: patchData,
          };

          const createResponse = await this.ctx.coreV1Api.createNamespacedConfigMap({
            namespace,
            body: newConfigMap,
          });

          return createResponse;
        }

        const existingData = existingConfigMap?.data;
        const patchOps: JsonPatchOp[] = [];

        const hasDataField = existingData && typeof existingData === 'object';

        if (!hasDataField) {
          patchOps.push({
            op: 'add',
            path: '/data',
            value: patchData,
          });
        } else {
          const dataObj = existingData as Record<string, unknown>;
          for (const [key, value] of Object.entries(patchData)) {
            const escapedKey = key.replace(/~/g, '~0').replace(/\//g, '~1');

            if (dataObj[key] !== undefined) {
              patchOps.push({
                op: 'replace',
                path: `/data/${escapedKey}`,
                value: value,
              });
            } else {
              patchOps.push({
                op: 'add',
                path: `/data/${escapedKey}`,
                value: value,
              });
            }
          }
        }

        const response = await this.ctx.coreV1Api.patchNamespacedConfigMap(
          {
            name,
            namespace,
            body: patchOps,
          },
          setHeaderOptions('Content-Type', 'application/json-patch+json'),
        );

        return response;
      } catch (error: unknown) {
        const httpCode = getHttpStatusCode(error);
        const statusCode = httpCode ?? 'unknown';
        const message = getKubernetesPatchErrorMessage(error);
        throw new Error(`Failed to patch ConfigMap ${name}: HTTP ${statusCode}: ${message}`);
      }
    }

    try {
      const existingConfigMap = await this.getConfigMap(name, namespace);

      if (!existingConfigMap) {
        const newConfigMap: k8s.V1ConfigMap = {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: {
            name,
            namespace,
          },
          data: patchData,
        };

        return (await makeKubernetesProxyRequest(
          this.ctx.kc,
          'POST',
          `/api/v1/namespaces/${namespace}/configmaps`,
          newConfigMap,
        )) as unknown as k8s.V1ConfigMap;
      }

      const existingData = existingConfigMap?.data;
      const patchOps: JsonPatchOp[] = [];

      const hasDataField = existingData && typeof existingData === 'object';

      if (!hasDataField) {
        patchOps.push({
          op: 'add',
          path: '/data',
          value: patchData,
        });
      } else {
        const dataObj = existingData as Record<string, unknown>;
        for (const [key, value] of Object.entries(patchData)) {
          const escapedKey = key.replace(/~/g, '~0').replace(/\//g, '~1');

          if (dataObj[key] !== undefined) {
            patchOps.push({
              op: 'replace',
              path: `/data/${escapedKey}`,
              value: value,
            });
          } else {
            patchOps.push({
              op: 'add',
              path: `/data/${escapedKey}`,
              value: value,
            });
          }
        }
      }

      return (await makeKubernetesProxyRequest(
        this.ctx.kc,
        'PATCH',
        `/api/v1/namespaces/${namespace}/configmaps/${name}`,
        patchOps,
      )) as unknown as k8s.V1ConfigMap;
    } catch (error: unknown) {
      const httpCode = getHttpStatusCode(error);
      const statusCode = httpCode ?? 'unknown';
      const message = getKubernetesPatchErrorMessage(error);
      throw new Error(`Failed to patch ConfigMap ${name}: HTTP ${statusCode}: ${message}`);
    }
  }

  async deleteSecret(name: string, namespace: string): Promise<boolean> {
    try {
      await this.ctx.coreV1Api.deleteNamespacedSecret({
        name,
        namespace,
      });
      return true;
    } catch (error: unknown) {
      if (getHttpStatusCode(error) === 404) {
        return true;
      }
      return false;
    }
  }

  async createPvc(
    name: string,
    namespace: string,
    size = '10Gi',
    storageClassName?: string,
    accessModes: string[] = ['ReadWriteOnce'],
  ): Promise<k8s.V1PersistentVolumeClaim> {
    try {
      const pvc: k8s.V1PersistentVolumeClaim = {
        apiVersion: 'v1',
        kind: 'PersistentVolumeClaim',
        metadata: { name, namespace },
        spec: { accessModes, resources: { requests: { storage: size } } },
      };
      if (storageClassName && pvc.spec) pvc.spec.storageClassName = storageClassName;

      return await this.ctx.coreV1Api.createNamespacedPersistentVolumeClaim({
        namespace,
        body: pvc,
      });
    } catch (error: unknown) {
      if (getHttpStatusCode(error) === 409 || getKubernetesErrorBodyCode(error) === 409) {
        return await this.ctx.coreV1Api.readNamespacedPersistentVolumeClaim({ name, namespace });
      }
      throw new Error(
        `Failed to create PVC ${name} in namespace ${namespace}: ${getErrorMessage(error)}`,
      );
    }
  }

  async deletePvc(
    name: string,
    namespace: string,
    options?: { ignoreNotFound?: boolean },
  ): Promise<boolean> {
    try {
      await this.ctx.coreV1Api.deleteNamespacedPersistentVolumeClaim({ name, namespace });
      return true;
    } catch (error: unknown) {
      if (getHttpStatusCode(error) === 404 || getKubernetesErrorBodyCode(error) === 404) {
        return !!options?.ignoreNotFound;
      }
      throw new Error(
        `Failed to delete PVC ${name} in namespace ${namespace}: ${getErrorMessage(error)}`,
      );
    }
  }

  async deleteConfigMapsWithPrefix(
    namespace: string,
    prefix: string,
    options?: { ignoreErrors?: boolean },
  ): Promise<void> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      try {
        const response = (await makeKubernetesProxyRequest(
          this.ctx.kc,
          'GET',
          `/api/v1/namespaces/${namespace}/configmaps`,
        )) as unknown as KubernetesListResource<KubernetesResource>;
        const configMaps = response.items ?? [];
        const matchingMaps = configMaps.filter((cm) => cm.metadata?.name?.startsWith(prefix));
        const deletePromises = matchingMaps.map(async (cm) => {
          const cmName = cm.metadata?.name;
          if (!cmName) return;
          try {
            await makeKubernetesProxyRequest(
              this.ctx.kc,
              'DELETE',
              `/api/v1/namespaces/${namespace}/configmaps/${cmName}`,
            );
          } catch (error: unknown) {
            if (!options?.ignoreErrors) throw error;
          }
        });
        await Promise.allSettled(deletePromises);
      } catch (error: unknown) {
        if (!options?.ignoreErrors) throw error;
      }
      return;
    }

    try {
      const response = await this.ctx.withRetry(
        () => this.ctx.coreV1Api.listNamespacedConfigMap({ namespace }),
        `List ConfigMaps in ${namespace}`,
      );
      const configMaps = response.items ?? [];
      const matchingMaps = configMaps.filter((cm: k8s.V1ConfigMap) =>
        cm.metadata?.name?.startsWith(prefix),
      );
      const deletePromises = matchingMaps.map((cm: k8s.V1ConfigMap) => {
        const cmName = cm.metadata?.name;
        if (!cmName) return Promise.resolve();
        return this.ctx.coreV1Api
          .deleteNamespacedConfigMap({ name: cmName, namespace })
          .catch((error: unknown) => {
            if (!options?.ignoreErrors) throw error;
          });
      });
      await Promise.allSettled(deletePromises);
    } catch (error: unknown) {
      if (!options?.ignoreErrors) throw error;
    }
  }

  async deleteAllSecrets(namespace: string, options?: { ignoreErrors?: boolean }): Promise<void> {
    try {
      const response = await this.ctx.withRetry(
        () => this.ctx.coreV1Api.listNamespacedSecret({ namespace }),
        `List Secrets in ${namespace}`,
      );
      const secrets = response.items ?? [];
      const deletePromises = secrets.map((secret: k8s.V1Secret) => {
        const name = secret.metadata?.name;
        if (!name || name.startsWith('default-') || name.includes('-token-')) {
          return Promise.resolve();
        }
        return this.deleteSecret(name, namespace).catch((error: unknown) => {
          if (!options?.ignoreErrors) throw error;
        });
      });
      await Promise.allSettled(deletePromises);
    } catch (error: unknown) {
      if (!options?.ignoreErrors) throw error;
    }
  }
}
