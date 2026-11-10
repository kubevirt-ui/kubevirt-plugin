/**
 * Base abstract class for data factories.
 * Provides common utilities for generating Kubernetes resource configurations in YAML format.
 */

import { generateRandomVmName } from '../utils/random-data-generator';

export interface BaseResourceConfig {
  customAnnotations?: Record<string, string>;
  customLabels?: Record<string, string>;
  name: string;
  namespace?: string;
}

export class BaseDataFactory {
  protected static addNamespaceField(namespace?: string): string {
    return namespace ? `\n  namespace: ${namespace}` : '';
  }

  protected static buildAnnotationsSection(
    annotations: Record<string, string> | undefined,
    indent = 4,
  ): string {
    if (!annotations || Object.keys(annotations).length === 0) {
      return '';
    }

    const spaces = ' '.repeat(indent);
    return Object.entries(annotations)
      .map(([key, value]) => `${spaces}${key}: '${value}'`)
      .join('\n');
  }

  protected static buildLabelsSection(
    labels: Record<string, string> | undefined,
    indent = 4,
  ): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }

    const spaces = ' '.repeat(indent);
    return Object.entries(labels)
      .map(([key, value]) => `${spaces}${key}: '${value}'`)
      .join('\n');
  }

  protected static buildMapSection(data: Record<string, unknown> | undefined, indent = 4): string {
    if (!data || Object.keys(data).length === 0) {
      return '';
    }

    const spaces = ' '.repeat(indent);
    return Object.entries(data)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${spaces}${key}: ${JSON.stringify(value)}`;
        }
        return `${spaces}${key}: ${value}`;
      })
      .join('\n');
  }

  static generateVmName(prefix = 'test-vm'): string {
    return generateRandomVmName(prefix);
  }

  protected static mergeConfig<T extends BaseResourceConfig>(
    defaultConfig: T,
    userConfig: Partial<T>,
  ): T {
    return { ...defaultConfig, ...userConfig };
  }

  protected static validateRequired<T extends Record<string, unknown>>(
    config: T,
    requiredFields: (keyof T)[],
  ): void {
    for (const field of requiredFields) {
      if (config[field] === undefined || config[field] === null) {
        throw new Error(`Required field '${String(field)}' is missing`);
      }
    }
  }
}
