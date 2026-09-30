import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

import { isHyperConvergedV1 } from './model';
import { type HyperConverged } from './types';

export const getRoleAggregationStrategyPatchPath = (hyperConverged: HyperConverged): string =>
  isHyperConvergedV1(hyperConverged)
    ? '/spec/virtualization/roleAggregationStrategy'
    : '/spec/roleAggregationStrategy';

export const getLiveMigrationConfigPatchPath = (
  hyperConverged: HyperConverged,
  fieldName: string,
): string =>
  isHyperConvergedV1(hyperConverged)
    ? `/spec/virtualization/liveMigrationConfig/${fieldName}`
    : `/spec/liveMigrationConfig/${fieldName}`;

export const getMemoryOvercommitPatchPath = (hyperConverged: HyperConverged): string =>
  isHyperConvergedV1(hyperConverged)
    ? '/spec/virtualization/higherWorkloadDensity/memoryOvercommitPercentage'
    : '/spec/higherWorkloadDensity/memoryOvercommitPercentage';

export const getKsmConfigurationPatchPath = (hyperConverged: HyperConverged): string =>
  isHyperConvergedV1(hyperConverged)
    ? '/spec/virtualization/ksmConfiguration'
    : '/spec/ksmConfiguration';

export const getVirtualMachineOptionsPatchPath = (
  hyperConverged: HyperConverged,
  fieldName: string,
): string =>
  isHyperConvergedV1(hyperConverged)
    ? `/spec/virtualization/virtualMachineOptions/${fieldName}`
    : `/spec/virtualMachineOptions/${fieldName}`;

export const getCommonTemplatesNamespacePatchPath = (hyperConverged: HyperConverged): string =>
  isHyperConvergedV1(hyperConverged)
    ? '/spec/workloadSources/commonTemplatesNamespace'
    : '/spec/commonTemplatesNamespace';

export const getCommonBootImageNamespacePatchPath = (hyperConverged: HyperConverged): string =>
  isHyperConvergedV1(hyperConverged)
    ? '/spec/workloadSources/commonBootImageNamespace'
    : '/spec/commonBootImageNamespace';

export const getEnableCommonBootImageImportPatchPath = (hyperConverged: HyperConverged): string =>
  isHyperConvergedV1(hyperConverged)
    ? '/spec/workloadSources/enableCommonBootImageImport'
    : '/spec/enableCommonBootImageImport';

export const getDataImportCronTemplatesPatchPath = (hyperConverged: HyperConverged): string =>
  isHyperConvergedV1(hyperConverged)
    ? '/spec/workloadSources/dataImportCronTemplates'
    : '/spec/dataImportCronTemplates';

const getObjectChild = (value: unknown, key: string): unknown => {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  return (value as Record<string, unknown>)[key];
};

export const getMissingV1AncestorPatches = (
  hyperConverged: HyperConverged,
  targetPath: string,
): Patch[] => {
  if (!isHyperConvergedV1(hyperConverged) || !targetPath.startsWith('/spec/')) {
    return [];
  }

  const segments = targetPath.split('/').filter(Boolean);
  const patches: Patch[] = [];
  let current: unknown = hyperConverged;

  for (let index = 0; index < segments.length - 1; index++) {
    const segment = segments[index];
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    const child = getObjectChild(current, segment);

    if (child === undefined) {
      patches.push({ op: K8S_OPS.ADD, path, value: {} });
      current = {};
      continue;
    }

    current = child;
  }

  return patches;
};

const withLeafAddWhenAncestorsCreated = (ancestors: Patch[], patch: Patch): Patch =>
  ancestors.length > 0 && patch.op === K8S_OPS.REPLACE ? { ...patch, op: K8S_OPS.ADD } : patch;

export const buildHyperConvergedPatch = (hyperConverged: HyperConverged, patch: Patch): Patch[] => {
  const ancestors = getMissingV1AncestorPatches(hyperConverged, patch.path);

  return [...ancestors, withLeafAddWhenAncestorsCreated(ancestors, patch)];
};

export const buildHyperConvergedPatches = (
  hyperConverged: HyperConverged,
  patches: Patch[],
): Patch[] => {
  const ancestorPaths = new Set<string>();
  const ancestorPatches: Patch[] = [];
  const leafPatches: Patch[] = [];

  for (const patch of patches) {
    const ancestors = getMissingV1AncestorPatches(hyperConverged, patch.path);

    for (const ancestorPatch of ancestors) {
      if (!ancestorPaths.has(ancestorPatch.path)) {
        ancestorPaths.add(ancestorPatch.path);
        ancestorPatches.push(ancestorPatch);
      }
    }

    leafPatches.push(withLeafAddWhenAncestorsCreated(ancestors, patch));
  }

  return [...ancestorPatches, ...leafPatches];
};
