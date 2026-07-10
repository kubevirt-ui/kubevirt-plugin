import type KubernetesClient from '@/clients/kubernetes-client';
import type { ClusterJanitor } from '@/utils/cluster-janitor';

export enum SetupPhase {
  AUTH = 'AUTH',
  CLUSTER = 'CLUSTER',
  BROWSER = 'BROWSER',
  REPORTING = 'REPORTING',
}

export enum TeardownScope {
  NAMESPACE = 'NAMESPACE',
  CLUSTER = 'CLUSTER',
  FILES = 'FILES',
}

export interface SetupContext {
  kubeConfigPath: string;
  storageStatePath: string;
  testNamespace: string;
  cnvNamespace: string;
  k8sClient?: KubernetesClient;
  effectiveKubeConfigPath?: string;
  authToken?: string;
  projectRoot: string;
  nonPrivUsername?: string;
  clusterJanitor?: ClusterJanitor;
}

export interface TeardownContext {
  testNamespace: string;
  k8sClient?: KubernetesClient;
  kubeConfigPath?: string;
  shouldCleanupClusterResources: boolean;
}

export type SetupOnError = 'throw' | 'warn' | 'skip';
export type TeardownOnError = 'warn' | 'skip';

export interface SetupRule {
  id: string;
  name: string;
  phase: SetupPhase;
  run: (ctx: SetupContext) => Promise<void>;
  guard?: (ctx: SetupContext) => boolean;
  onError: SetupOnError;
}

export interface TeardownRule {
  id: string;
  name: string;
  scope: TeardownScope;
  run: (ctx: TeardownContext) => Promise<void>;
  guard?: (ctx: TeardownContext) => boolean;
  onError: TeardownOnError;
}
