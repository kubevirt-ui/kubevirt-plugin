import type { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import type { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import type { Template } from '@kubevirt-utils/resources/template/utils';

type WatchListByKind = Record<string, K8sResourceCommon[]>;

let watchLists: WatchListByKind = {};
let templates: Template[] | null = null;
let bootableVolumes: BootableVolume[] | null = null;

export const resetGalleryWatchRegistry = (): void => {
  watchLists = {};
  templates = null;
  bootableVolumes = null;
};

export const setGalleryWatchRegistry = (payload: {
  bootableVolumes?: BootableVolume[];
  templates?: Template[];
  watchLists: WatchListByKind;
}): void => {
  watchLists = payload.watchLists;
  templates = payload.templates ?? null;
  bootableVolumes = payload.bootableVolumes ?? null;
};

export const getGalleryWatchList = (
  watchOptions?: WatchK8sResource & { groupVersionKind?: { kind?: string } },
): K8sResourceCommon[] | undefined => {
  const kind = watchOptions?.groupVersionKind?.kind;
  if (!kind) {
    return undefined;
  }
  return watchLists[kind];
};

export const getGalleryTemplates = (): Template[] | null => templates;

export const getGalleryBootableVolumes = (): BootableVolume[] | null => bootableVolumes;
