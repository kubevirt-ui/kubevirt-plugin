/**
 * Singleton context manager for storing and retrieving test data across test scenarios.
 * Uses typed keys via ContextKey enum for type safety and autocomplete.
 *
 * Also accumulates created resources for automatic cleanup via {@link trackResource}.
 * The cleanup fixture drains {@link drainTrackedResources} after each test.
 */

import type { TrackedResourceType } from '@/utils/test-resource-tracker';

import type { ContextKey, ContextValueType } from './context-keys';

export interface TrackedResourceEntry {
  type: TrackedResourceType;
  name: string;
  namespace?: string;
}

export default class ScenarioContextManager {
  private static instance: ScenarioContextManager;
  private store: Map<string, unknown>;
  private trackedResources: TrackedResourceEntry[] = [];

  private constructor() {
    this.store = new Map();
  }

  public static getInstance(): ScenarioContextManager {
    if (!ScenarioContextManager.instance) {
      ScenarioContextManager.instance = new ScenarioContextManager();
    }
    return ScenarioContextManager.instance;
  }

  public clear(): void {
    this.store.clear();
  }

  public get<K extends ContextKey>(key: K): ContextValueType<K> | undefined;
  public get<T>(key: string): T | undefined;
  public get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  public overwrite<K extends ContextKey>(key: K, value: ContextValueType<K>): this;
  public overwrite<T>(key: string, value: T): this;
  public overwrite<T>(key: string, value: T): this {
    if (!this.store.has(key)) {
      throw new Error(`Key "${key}" does not exist. Cannot overwrite.`);
    }
    this.store.set(key, value);
    return this;
  }

  public set<K extends ContextKey>(key: K, value: ContextValueType<K>): this;
  public set<T>(key: string, value: T): this;
  public set<T>(key: string, value: T): this {
    this.store.set(key, value);
    return this;
  }

  public has(key: ContextKey | string): boolean {
    return this.store.has(key);
  }

  public delete(key: ContextKey | string): boolean {
    return this.store.delete(key);
  }

  public keys(): IterableIterator<string> {
    return this.store.keys();
  }

  /**
   * Register a resource for automatic cleanup after the current test.
   * Step drivers call this whenever they create a Kubernetes resource.
   * Deduplicates by type+name+namespace.
   */
  public trackResource(type: TrackedResourceType, name: string, namespace?: string): void {
    const exists = this.trackedResources.some(
      (r) => r.type === type && r.name === name && r.namespace === namespace,
    );
    if (!exists) {
      this.trackedResources.push({ type, name, namespace });
    }
  }

  /**
   * Return all tracked resources and clear the list.
   * Called by the cleanup fixture after each test.
   */
  public drainTrackedResources(): TrackedResourceEntry[] {
    const resources = [...this.trackedResources];
    this.trackedResources = [];
    return resources;
  }

  /** Number of resources currently tracked for cleanup. */
  public get trackedResourceCount(): number {
    return this.trackedResources.length;
  }
}
