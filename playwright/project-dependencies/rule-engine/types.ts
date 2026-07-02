import type { KubernetesClient } from '@/clients/kubernetes-client';

export enum SetupPhase {
  AUTH = 'AUTH',
  CLUSTER = 'CLUSTER',
  BROWSER = 'BROWSER',
}

export enum TeardownScope {
  NAMESPACE = 'NAMESPACE',
  FILES = 'FILES',
}

export interface SetupContext {
  authToken?: string;
  cnvNamespace: string;
  effectiveKubeConfigPath?: string;
  k8sClient?: KubernetesClient;
  kubeConfigPath: string;
  storageStatePath: string;
  testNamespace: string;
  nonPrivUsername?: string;
}

export interface TeardownContext {
  k8sClient?: KubernetesClient;
  testNamespace: string;
  cnvNamespace: string;
  kubeConfigPath: string;
  shouldCleanupClusterResources: boolean;
}

export interface SetupRule {
  id: string;
  name: string;
  phase: SetupPhase;
  run: (ctx: SetupContext) => Promise<void>;
  guard?: (ctx: SetupContext) => boolean;
  onError: 'throw' | 'warn' | 'skip';
}

export interface TeardownRule {
  id: string;
  name: string;
  scope: TeardownScope;
  run: (ctx: TeardownContext) => Promise<void>;
  guard?: (ctx: TeardownContext) => boolean;
  onError: 'throw' | 'warn' | 'skip';
}
