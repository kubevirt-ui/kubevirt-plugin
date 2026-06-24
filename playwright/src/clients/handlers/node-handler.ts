import type { KubernetesCondition, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';

import type { KubernetesHandlerContext } from './kubernetes-api-context';
import type { VirtualMachineHandler } from './vm-handler';

interface CoreV1ApiNodeOps {
  readNode: (args: { name: string }) => Promise<{ body?: KubernetesResource } | KubernetesResource>;
  replaceNode: (args: {
    name: string;
    body: KubernetesResource;
  }) => Promise<{ body?: KubernetesResource } | KubernetesResource>;
}

export class NodeHandler {
  constructor(
    private readonly ctx: KubernetesHandlerContext,
    private readonly vm: VirtualMachineHandler,
  ) {}

  async getNodes() {
    try {
      const response = await this.ctx.coreV1Api.listNode();
      const r = response as unknown as KubernetesResource & {
        items?: KubernetesResource[];
        body?: { items?: KubernetesResource[] };
      };
      return r.items ?? r.body?.items ?? [];
    } catch (error: unknown) {
      throw new Error(`Failed to get nodes: ${getErrorMessage(error)}`);
    }
  }

  async getReadyNodes() {
    try {
      const nodes = await this.getNodes();
      return nodes.filter((node) => {
        const conditions =
          ((node.status as Record<string, unknown> | undefined)
            ?.conditions as KubernetesCondition[]) || [];
        const readyCondition = conditions.find((c) => c.type === 'Ready');
        return readyCondition?.status === 'True';
      });
    } catch (error: unknown) {
      throw new Error(`Failed to get ready nodes: ${getErrorMessage(error)}`);
    }
  }

  async isClusterSingleNode(): Promise<boolean> {
    try {
      const readyNodes = await this.getReadyNodes();
      return readyNodes.length === 1;
    } catch (error: unknown) {
      throw new Error(`Failed to determine if cluster is single-node: ${getErrorMessage(error)}`);
    }
  }

  async getMigrationTargetNodes(excludeNodeName?: string): Promise<KubernetesResource[]> {
    try {
      const allNodes = await this.getNodes();
      return allNodes.filter((node) => {
        const conditions =
          ((node.status as Record<string, unknown> | undefined)
            ?.conditions as KubernetesCondition[]) || [];
        const readyCondition = conditions.find((c) => c.type === 'Ready');
        if (readyCondition?.status !== 'True') {
          return false;
        }

        const labels = node.metadata?.labels || {};
        const hasWorkerLabel =
          labels['node-role.kubernetes.io/worker'] === '' ||
          labels['node-role.kubernetes.io/worker'] === 'true' ||
          node.metadata?.name?.toLowerCase().includes('worker');
        if (!hasWorkerLabel) {
          return false;
        }

        const schedulingCondition = conditions.find((c) => c.type === 'SchedulingDisabled');
        if (schedulingCondition?.status === 'True') {
          return false;
        }

        if (excludeNodeName && node.metadata?.name === excludeNodeName) {
          return false;
        }

        return true;
      });
    } catch (error: unknown) {
      throw new Error(`Failed to get migration target nodes: ${getErrorMessage(error)}`);
    }
  }

  private parseCpuQuantity(q: string | undefined): number {
    if (!q || typeof q !== 'string') return 0;
    const s = q.trim();
    if (s.endsWith('m') && !s.endsWith('mi')) {
      return parseFloat(s) || 0;
    }
    const num = parseFloat(s) || 0;
    return num * 1000;
  }

  private parseMemoryQuantity(q: string | undefined): number {
    if (!q || typeof q !== 'string') return 0;
    const s = q.trim();
    const match = s.match(/^(\d+(?:\.\d+)?)\s*([KMGTPE]i?)?$/);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = (match[2] || '').toLowerCase();
    if (unit === 'ki') return num * 1024;
    if (unit === 'mi') return num * 1024 * 1024;
    if (unit === 'gi') return num * 1024 * 1024 * 1024;
    if (unit === 'ti') return num * 1024 * 1024 * 1024 * 1024;
    return num;
  }

  getNodeNameWithLowerAllocatable(nodes: KubernetesResource[]): string | undefined {
    if (!nodes?.length) return undefined;
    let minScore = Number.POSITIVE_INFINITY;
    let name: string | undefined;
    for (const node of nodes) {
      const allocatable =
        ((node.status as Record<string, unknown> | undefined)?.['allocatable'] as
          | Record<string, string>
          | undefined) || {};
      const cpu = this.parseCpuQuantity(allocatable.cpu);
      const memBytes = this.parseMemoryQuantity(allocatable.memory);
      const score = cpu + memBytes / (1024 * 1024 * 1024);
      if (score < minScore) {
        minScore = score;
        name = node?.metadata?.name;
      }
    }
    return name;
  }

  async cordonNode(nodeName: string): Promise<void> {
    const maxAttempts = 3;
    let lastError: Error | null = null;
    const api = this.ctx.coreV1Api as unknown as CoreV1ApiNodeOps;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await api.readNode({ name: nodeName });
        const r = response as { body?: KubernetesResource } | KubernetesResource;
        const node = ('body' in r && r.body !== undefined ? r.body : r) as KubernetesResource;
        if (!node) throw new Error('Node not found');
        const spec = (node.spec ?? {}) as Record<string, unknown>;
        const body: KubernetesResource = {
          ...node,
          spec: { ...spec, unschedulable: true },
        };
        await api.replaceNode({ name: nodeName, body });
        return;
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(getErrorMessage(error));
        const msg = getErrorMessage(error);
        const bodyCode =
          typeof error === 'object' && error !== null && 'body' in error
            ? (error as { body?: { code?: number } }).body?.code
            : undefined;
        const rspBodyCode =
          typeof error === 'object' && error !== null && 'response' in error
            ? (error as { response?: { body?: { code?: number } } }).response?.body?.code
            : undefined;
        const is409 =
          rspBodyCode === 409 ||
          bodyCode === 409 ||
          msg.includes('409') ||
          msg.includes('Conflict');
        if (!is409 || attempt === maxAttempts) {
          throw new Error(`Failed to cordon node ${nodeName}: ${msg || String(error)}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw lastError || new Error(`Failed to cordon node ${nodeName}`);
  }

  async uncordonNode(nodeName: string): Promise<void> {
    const maxAttempts = 3;
    let lastError: Error | null = null;
    const api = this.ctx.coreV1Api as unknown as CoreV1ApiNodeOps;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await api.readNode({ name: nodeName });
        const r = response as { body?: KubernetesResource } | KubernetesResource;
        const node = ('body' in r && r.body !== undefined ? r.body : r) as KubernetesResource;
        if (!node) throw new Error('Node not found');
        const spec = (node.spec ?? {}) as Record<string, unknown>;
        const body: KubernetesResource = {
          ...node,
          spec: { ...spec, unschedulable: false },
        };
        await api.replaceNode({ name: nodeName, body });
        return;
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(getErrorMessage(error));
        const msg = getErrorMessage(error);
        const bodyCode =
          typeof error === 'object' && error !== null && 'body' in error
            ? (error as { body?: { code?: number } }).body?.code
            : undefined;
        const rspBodyCode =
          typeof error === 'object' && error !== null && 'response' in error
            ? (error as { response?: { body?: { code?: number } } }).response?.body?.code
            : undefined;
        const is409 =
          rspBodyCode === 409 ||
          bodyCode === 409 ||
          msg.includes('409') ||
          msg.includes('Conflict');
        if (!is409 || attempt === maxAttempts) {
          throw new Error(`Failed to uncordon node ${nodeName}: ${msg || String(error)}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw lastError || new Error(`Failed to uncordon node ${nodeName}`);
  }

  async getVmNodeName(vmName: string, namespace: string): Promise<null | string> {
    try {
      const vmi = (await this.vm.getVirtualMachineInstance(
        vmName,
        namespace,
      )) as KubernetesResource;

      const st = vmi.status as Record<string, unknown> | undefined;
      const nodeNm = st?.['nodeName'];
      if (typeof nodeNm === 'string' && nodeNm) {
        return nodeNm;
      }

      return null;
    } catch (error: unknown) {
      throw new Error(`Failed to get VM node name: ${getErrorMessage(error)}`);
    }
  }

  async getNodesWithVmsInNamespace(namespace: string): Promise<string[]> {
    try {
      const vms = await this.vm.listVirtualMachines(namespace);
      const nodeNames = new Set<string>();

      for (const vm of vms) {
        if (vm.metadata?.name) {
          try {
            const nodeName = await this.getVmNodeName(vm.metadata.name, namespace);
            if (nodeName) {
              nodeNames.add(nodeName);
            }
          } catch {
            continue;
          }
        }
      }

      return Array.from(nodeNames);
    } catch (error: unknown) {
      throw new Error(
        `Failed to get nodes with VMs in namespace ${namespace}: ${getErrorMessage(error)}`,
      );
    }
  }
}
