import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';
import { waitForCondition } from '@/utils/wait-helpers';
import * as k8s from '@kubernetes/client-node';

import type KubernetesClient from '../kubernetes-client';
import { getKubernetesProxyUrl } from '../kubernetes-proxy';

export class ClusterSetupHandler {
  constructor(private readonly client: KubernetesClient) {}

  async verifyAuthentication(): Promise<boolean> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      await this.client.makeProxyRequest('GET', '/api/v1/namespaces?limit=1');
    } else {
      await this.client.getCoreV1Api().listNamespace({ limit: 1 });
    }

    return true;
  }

  async getNamespaceByName(name: string): Promise<k8s.V1Namespace | undefined> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      const result = await this.client.makeProxyRequest(
        'GET',
        `/api/v1/namespaces/${encodeURIComponent(name)}`,
      );
      return result ?? undefined;
    }
    try {
      const response = await this.client.getCoreV1Api().readNamespace({ name });
      const r = response as { body?: k8s.V1Namespace } | k8s.V1Namespace;
      return ('body' in r && r.body !== undefined ? r.body : r) as k8s.V1Namespace | undefined;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      const statusCode =
        typeof error === 'object' && error !== null && 'statusCode' in error
          ? (error as { statusCode?: number }).statusCode
          : undefined;
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? (error as { code?: number }).code
          : undefined;
      const body =
        typeof error === 'object' && error !== null && 'body' in error
          ? (error as { body?: { code?: number } }).body
          : undefined;
      const responseStatus =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { statusCode?: number } }).response?.statusCode
          : undefined;
      if (
        statusCode === 404 ||
        code === 404 ||
        body?.code === 404 ||
        responseStatus === 404 ||
        msg.includes('404') ||
        msg.includes('not found') ||
        msg.includes('NotFound')
      ) {
        return undefined;
      }
      throw error;
    }
  }

  async createNamespaceResource(body: k8s.V1Namespace): Promise<void> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      await this.client.makeProxyRequest('POST', '/api/v1/namespaces', body);
      return;
    }
    await this.client.getCoreV1Api().createNamespace({ body });
  }

  async setupKubevirtUiConfig(
    cnvNamespace = 'openshift-cnv',
    username = 'kube-admin',
  ): Promise<void> {
    try {
      const existingConfigMap = await this.client.getConfigMap(
        'kubevirt-user-settings',
        cnvNamespace,
      );
      let existingUserSettings: Record<string, unknown> = {};

      const configData = existingConfigMap?.data as Record<string, string> | undefined;
      if (configData?.[username]) {
        try {
          existingUserSettings = JSON.parse(configData[username]) as Record<string, unknown>;
        } catch {
          existingUserSettings = {};
        }
      }

      const prevQuick =
        typeof existingUserSettings['quickStart'] === 'object' &&
        existingUserSettings['quickStart'] !== null &&
        !Array.isArray(existingUserSettings['quickStart'])
          ? (existingUserSettings['quickStart'] as Record<string, unknown>)
          : {};

      const updatedUserSettings = {
        ...existingUserSettings,
        quickStart: {
          ...prevQuick,
          dontShowWelcomeModal: true,
        },
      };

      await this.client.patchConfigMap('kubevirt-user-settings', cnvNamespace, {
        [username]: JSON.stringify(updatedUserSettings),
      });
      const configMap = await this.client.getConfigMap('kubevirt-user-settings', cnvNamespace);
      if (configMap) {
        const userSettings = (configMap.data as Record<string, string> | undefined)?.[username];
        if (userSettings) {
          try {
            const parsed = JSON.parse(userSettings);
            if (parsed?.quickStart?.dontShowWelcomeModal !== true) {
              console.warn(
                `Warning: Welcome modal setting verification failed: Setting is not correct in ConfigMap`,
              );
              console.warn(
                `   Expected: dontShowWelcomeModal=true, Got: ${JSON.stringify(
                  parsed?.quickStart,
                )}`,
              );
            }
          } catch (parseError) {
            console.warn(`Warning: Failed to parse user settings from ConfigMap: ${parseError}`);
          }
        } else {
          console.warn(
            `Warning: User settings key '${username}' not found in ConfigMap after patch`,
          );
        }
      } else {
        console.warn(
          `Warning: ConfigMap 'kubevirt-user-settings' not found after patch (might not exist yet)`,
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.warn(
        `Warning: Failed to patch kubevirt-user-settings ConfigMap: ${errorMessage}. Continuing setup...`,
      );
      console.warn(
        `   ConfigMap: kubevirt-user-settings, Namespace: ${cnvNamespace}, Username: ${username}`,
      );
    }

    try {
      await this.client.patchConfigMap('kubevirt-ui-features', cnvNamespace, {
        advancedSearch: 'true',
        treeViewFolders: 'true',
      });
    } catch {
      console.warn('Warning: Failed to patch kubevirt-ui-features ConfigMap. Continuing setup...');
    }
  }

  async setupConsoleUserSettings(
    username = 'kubeadmin',
    defaultNamespace?: string,
    maxAttempts = 5,
  ): Promise<boolean> {
    const namespace = 'openshift-console-user-settings';
    const configMapName = `user-settings-${username}`;

    const patchData: Record<string, string> = {
      'console.guidedTour': JSON.stringify({
        admin: { completed: true },
        dev: { completed: true },
        'virtualization-perspective': { completed: true },
      }),
    };

    if (defaultNamespace) {
      patchData['console.lastNamespace'] = defaultNamespace;
    }

    // The console creates the user-settings ConfigMap asynchronously after first login.
    // Retry a few times to give it a chance to appear before giving up.
    const delayMs = 3000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.client.patchConfigMap(configMapName, namespace, patchData);
        return true;
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('404')) {
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }
          return false;
        }
        if (msg.includes('403')) {
          return false;
        }
        throw error;
      }
    }
    return false;
  }

  async getUserUid(username: string): Promise<string | undefined> {
    try {
      const user = await this.client.getClusterCustomResource(
        'user.openshift.io',
        'v1',
        'users',
        username,
      );
      return user?.metadata?.uid;
    } catch {
      return undefined;
    }
  }

  async canUserPerformAction(
    username: string,
    namespace: string,
    verb: string,
    group: string,
    resource: string,
  ): Promise<boolean> {
    const body = {
      apiVersion: 'authorization.k8s.io/v1',
      kind: 'LocalSubjectAccessReview',
      metadata: { namespace },
      spec: {
        user: username,
        resourceAttributes: { namespace, verb, group, resource },
      },
    };

    try {
      const proxyUrl = getKubernetesProxyUrl();
      let result: KubernetesResource | null | undefined;
      if (proxyUrl) {
        result = (await this.client.makeProxyRequest(
          'POST',
          `/apis/authorization.k8s.io/v1/namespaces/${namespace}/localsubjectaccessreviews`,
          body,
        )) as KubernetesResource | null | undefined;
      } else {
        const authApi = this.client.getKubeConfig().makeApiClient(k8s.AuthorizationV1Api);
        const response = await authApi.createNamespacedLocalSubjectAccessReview({
          namespace,
          body: body as k8s.V1LocalSubjectAccessReview,
        });
        const r = response as { body?: KubernetesResource } | KubernetesResource;
        result = ('body' in r && r.body !== undefined ? r.body : r) as KubernetesResource;
      }
      return result?.status?.['allowed'] === true;
    } catch {
      return false;
    }
  }

  async disableVirtualizationWelcomeSettings(
    cnvNamespace = 'openshift-cnv',
    username = 'kube-admin',
    userUid?: string,
  ): Promise<boolean> {
    try {
      const existingConfigMap = await this.client.getConfigMap(
        'kubevirt-user-settings',
        cnvNamespace,
      );

      const keysToUpdate = [username];
      if (userUid && userUid !== username) {
        keysToUpdate.push(userUid);
      }

      const patchData: Record<string, string> = {};

      for (const key of keysToUpdate) {
        let existingUserSettings: Record<string, unknown> = {};
        const patchConfigData = existingConfigMap?.data as Record<string, string> | undefined;
        if (patchConfigData?.[key]) {
          try {
            existingUserSettings = JSON.parse(patchConfigData[key]) as Record<string, unknown>;
          } catch {
            existingUserSettings = {};
          }
        }

        const currentQuickStart =
          typeof existingUserSettings['quickStart'] === 'object' &&
          existingUserSettings['quickStart'] !== null &&
          !Array.isArray(existingUserSettings['quickStart'])
            ? (existingUserSettings['quickStart'] as Record<string, unknown>)
            : {};

        const prevOnboarding =
          typeof existingUserSettings['onboardingPopoversHidden'] === 'object' &&
          existingUserSettings['onboardingPopoversHidden'] !== null &&
          !Array.isArray(existingUserSettings['onboardingPopoversHidden'])
            ? (existingUserSettings['onboardingPopoversHidden'] as Record<string, unknown>)
            : {};

        const updatedUserSettings = {
          ...existingUserSettings,
          navigation: { autoHideNav: false },
          quickStart: {
            ...currentQuickStart,
            dontShowWelcomeModal: true,
            activeQuickStartID: '',
          },
          guidedTour: false,
          onboardingPopoversHidden: {
            vmsTab: true,
            catalog: true,
            createProject: true,
            ...prevOnboarding,
          },
        };
        patchData[key] = JSON.stringify(updatedUserSettings);
      }

      await this.client.patchConfigMap('kubevirt-user-settings', cnvNamespace, patchData);
      return true;
    } catch {
      return false;
    }
  }

  /** Returns StorageClass resource names in the cluster. */
  async getStorageClassNames(): Promise<string[]> {
    const items = await this.client.listClusterCustomResources(
      'storage.k8s.io',
      'v1',
      'storageclasses',
    );
    return items
      .map((sc: KubernetesResource) => sc?.metadata?.name as string | undefined)
      .filter((n: string | undefined): n is string => Boolean(n && String(n).trim()))
      .map((n: string) => n.trim());
  }

  /**
   * Set the default StorageClass for VirtualMachines (KubeVirt/CNV).
   * Sets the annotation storageclass.kubevirt.io/is-default-virt-class=true on the
   * given StorageClass and false on all others.
   */
  async setDefaultStorageClassForVirtualMachines(storageClassName: string): Promise<void> {
    const group = 'storage.k8s.io';
    const version = 'v1';
    const plural = 'storageclasses';
    const annotationPath = '/metadata/annotations/storageclass.kubevirt.io~1is-default-virt-class';

    const items = await this.client.listClusterCustomResources(group, version, plural);
    const names = items
      .map((sc: KubernetesResource) => (sc?.metadata?.name as string).trim())
      .filter(Boolean);

    const clearPatch = [{ op: 'add' as const, path: annotationPath, value: 'false' }];
    const setPatch = [{ op: 'add' as const, path: annotationPath, value: 'true' }];

    for (const name of names) {
      await this.client.patchClusterCustomResourceWithJsonPatch(
        group,
        version,
        plural,
        name,
        clearPatch,
      );
    }
    await this.client.patchClusterCustomResourceWithJsonPatch(
      group,
      version,
      plural,
      storageClassName,
      setPatch,
    );
  }

  /** True if any subscription in openshift-cluster-observability-operator has status.installedCSV. */
  async isClusterObservabilityOperatorInstalled(): Promise<boolean> {
    const namespace = 'openshift-cluster-observability-operator';
    const subscriptions = await this.client.listCustomResources(
      'operators.coreos.com',
      'v1alpha1',
      namespace,
      'subscriptions',
    );
    return subscriptions.some(
      (sub: { status?: { installedCSV?: string } }) => !!sub.status?.installedCSV,
    );
  }

  async waitForClusterObservabilityOperatorInstalled(
    timeoutMs: number = TestTimeouts.OPERATOR_INSTALL,
  ): Promise<boolean> {
    return waitForCondition(() => this.isClusterObservabilityOperatorInstalled(), timeoutMs, 10000);
  }

  /**
   * If Cluster Observability Operator is installed, remove OLM Subscriptions and CSVs in
   * openshift-cluster-observability-operator so tests start from a clean OLM state.
   */
  async ensureClusterObservabilityOperatorUninstalled(): Promise<void> {
    const namespace = 'openshift-cluster-observability-operator';
    const group = 'operators.coreos.com';
    const version = 'v1alpha1';

    const subscriptions = await this.client.listCustomResources(
      group,
      version,
      namespace,
      'subscriptions',
    );
    await Promise.allSettled(
      subscriptions.map((sub: { metadata?: { name?: string } }) => {
        const name = sub.metadata?.name;
        if (!name) return Promise.resolve();
        return this.client
          .deleteCustomResource(group, version, namespace, 'subscriptions', name)
          .catch(() => undefined);
      }),
    );

    const csvs = await this.client.listCustomResources(
      group,
      version,
      namespace,
      'clusterserviceversions',
    );
    await Promise.allSettled(
      csvs.map((csv: { metadata?: { name?: string } }) => {
        const name = csv.metadata?.name;
        if (!name) return Promise.resolve();
        return this.client
          .deleteCustomResource(group, version, namespace, 'clusterserviceversions', name)
          .catch(() => undefined);
      }),
    );
  }
}
