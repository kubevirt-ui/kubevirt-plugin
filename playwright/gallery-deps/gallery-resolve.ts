import path from 'path';
import { fileURLToPath } from 'url';

import {
  CONSOLE_HOST_STUB_FILES,
  MULTICLUSTER_SDK_PACKAGE,
  MULTICLUSTER_SDK_SUBPATH_STUBS,
  OPENSHIFT_SDK_INTERNAL_PACKAGE,
  OPENSHIFT_SDK_PACKAGE,
  OPENSHIFT_SDK_SUBPATH_STUBS,
} from './constants';

const galleryDepsDir = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(galleryDepsDir, '../..');
export const stubsDir = path.join(projectRoot, 'playwright/stubs');

const stubPath = (file: string): string => path.join(stubsDir, file);

const GALLERY_MODULE_STUBS: Record<string, string> = {
  '@kubevirt-utils/resources/vm/hooks/useVMI': 'useVMI.ts',
};

/** Map bare module id → absolute stub or shim path (console / SDK / multicluster). */
export const resolveGalleryStubModule = (id: string): string | null => {
  if (id in CONSOLE_HOST_STUB_FILES) {
    return stubPath(CONSOLE_HOST_STUB_FILES[id]);
  }

  if (id.startsWith('@console/')) {
    return stubPath('console-host-stub.ts');
  }

  if (
    id === OPENSHIFT_SDK_INTERNAL_PACKAGE ||
    id.startsWith(`${OPENSHIFT_SDK_INTERNAL_PACKAGE}/`)
  ) {
    return stubPath('openshift-console-internal-sdk-stub.ts');
  }

  if (id === OPENSHIFT_SDK_PACKAGE) {
    return stubPath('openshift-console-sdk-catchall.ts');
  }
  if (id.startsWith(`${OPENSHIFT_SDK_PACKAGE}/`)) {
    const subpath = id.slice(OPENSHIFT_SDK_PACKAGE.length + 1);
    const stubFile = OPENSHIFT_SDK_SUBPATH_STUBS[subpath] ?? 'openshift-console-sdk-catchall.ts';
    return stubPath(stubFile);
  }

  if (id === MULTICLUSTER_SDK_PACKAGE) {
    return stubPath('stolostron-multicluster-sdk.ts');
  }
  if (id.startsWith(`${MULTICLUSTER_SDK_PACKAGE}/`)) {
    const subpath = id.slice(MULTICLUSTER_SDK_PACKAGE.length + 1);
    const stubFile = MULTICLUSTER_SDK_SUBPATH_STUBS[subpath] ?? 'stolostron-multicluster-sdk.ts';
    return stubPath(stubFile);
  }

  return null;
};

const alias = (srcRelative: string, stubFile: string): [string, string] => [
  path.join(projectRoot, srcRelative),
  path.join(stubsDir, stubFile),
];

/** Rspack/webpack `resolve.alias` entries for the VM wizard gallery scene. */
export const getGalleryResolveAlias = (): Record<string, string> => ({
  '@images': path.join(projectRoot, 'images'),
  '@kubevirt-extensions': path.join(projectRoot, 'src/extensions'),
  '@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels': path.join(
    stubsDir,
    'useAutoAppliedLabels-gallery.ts',
  ),
  '@kubevirt-utils/hooks/useFeatures/useFeatures': path.join(
    stubsDir,
    'useFeatures-wizard-gallery.ts',
  ),
  '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap': path.join(
    stubsDir,
    'useFeatures-wizard-gallery.ts',
  ),
  '@kubevirt-utils/hooks/useInstanceTypesAndPreferences': path.join(
    stubsDir,
    'useInstanceTypesAndPreferences-gallery.ts',
  ),
  '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource': path.join(
    stubsDir,
    'useKubevirtWatchResource.ts',
  ),
  ...Object.fromEntries([
    alias(
      'src/utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource.ts',
      'useKubevirtWatchResource.ts',
    ),
    alias(
      'src/multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink.tsx',
      'MulticlusterResourceLink-gallery.tsx',
    ),
    alias(
      'src/views/virtualmachines/wizard/hooks/useWizardInitialValues.ts',
      'useWizardInitialValues-gallery.ts',
    ),
    alias('src/views/virtualmachines/wizard/hooks/useCloseWizard.ts', 'useCloseWizard-gallery.ts'),
    alias(
      'src/views/virtualmachines/wizard/steps/CloneSourceStep/components/VirtualMachinesList/hooks/useCloneSourceVMs.ts',
      'useCloneSourceVMs-gallery.ts',
    ),
    alias(
      'src/views/virtualmachines/wizard/steps/CloneSourceStep/components/VirtualMachinesList/hooks/useCloneSourceVMColumns.ts',
      'useCloneSourceVMColumns-gallery.ts',
    ),
    alias(
      'src/multicluster/hooks/useACMExtensionActions/useACMExtensionActions.ts',
      'useACMExtensionActions-gallery.ts',
    ),
    alias('src/utils/hooks/useFeatures/useFeatures.ts', 'useFeatures-wizard-gallery.ts'),
    alias('src/utils/hooks/useFeatures/useFeaturesConfigMap.ts', 'useFeatures-wizard-gallery.ts'),
    alias(
      'src/utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels.ts',
      'useAutoAppliedLabels-gallery.ts',
    ),
    alias(
      'src/utils/hooks/useInstanceTypesAndPreferences.ts',
      'useInstanceTypesAndPreferences-gallery.ts',
    ),
    alias(
      'src/views/virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useTemplatesWithAvailableSource/useTemplatesWithAvailableSource.ts',
      'useWizardTemplatesWithAvailableSource-gallery.ts',
    ),
    alias(
      'src/utils/hooks/useVMTemplateFeatureFlag/useIsVMTemplateFeatureEnabled.ts',
      'useIsVMTemplateFeatureEnabled-gallery.ts',
    ),
    alias(
      'src/views/virtualmachines/wizard/hooks/useVMGenerationNavClick.ts',
      'useVMGenerationNavClick-gallery.ts',
    ),
    alias(
      'src/views/virtualmachines/wizard/steps/TemplateStep/hooks/useCreateVMFromTemplate.ts',
      'useCreateVMFromTemplate-gallery.ts',
    ),
    alias(
      'src/views/virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/usePreferenceSelectOptions.ts',
      'usePreferenceSelectOptions-gallery.ts',
    ),
    alias(
      'src/views/templates/list/hooks/useOpenShiftTemplates.ts',
      'useOpenShiftTemplates-gallery.ts',
    ),
    alias(
      'src/utils/resources/bootableresources/hooks/useBootableVolumes.ts',
      'useBootableVolumes-gallery.ts',
    ),
  ]),
  '@kubevirt-utils': path.join(projectRoot, 'src/utils'),
  '@lightspeed': path.join(projectRoot, 'src/views/lightspeed'),
  '@multicluster/hooks/useClusterParam': path.join(stubsDir, 'useClusterParam-gallery.ts'),
  '@multicluster/hooks/useK8sWatchData': path.join(stubsDir, 'useK8sWatchData.ts'),
  '@multicluster/k8sRequests': path.join(stubsDir, 'multicluster-k8sRequests.ts'),
  '@multicluster/useIsACMPage': path.join(stubsDir, 'useIsACMPage-gallery.ts'),
  '@multicluster': path.join(projectRoot, 'src/multicluster'),
  '@search': path.join(projectRoot, 'src/views/search'),
  '@settings': path.join(projectRoot, 'src/views/settings'),
  '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes': path.join(
    stubsDir,
    'useBootableVolumes-gallery.ts',
  ),
  '@templates': path.join(projectRoot, 'src/views/templates'),
  '@topology': path.join(projectRoot, 'src/views/topology'),
  '@virtualmachines': path.join(projectRoot, 'src/views/virtualmachines'),
  buffer: 'buffer',
  process: 'process/browser',
});

const endsWithStub = (request: string, file: string): boolean =>
  request.endsWith(file) || request.includes(`/${file}`);

export const resolveGalleryRequest = (request: string): string => {
  if (request in GALLERY_MODULE_STUBS) {
    return stubPath(GALLERY_MODULE_STUBS[request]);
  }
  if (request.startsWith('src/')) {
    return path.join(projectRoot, request);
  }

  const stubBySuffix: Array<[string, string]> = [
    ['useKubevirtWatchResource.ts', 'useKubevirtWatchResource.ts'],
    ['MulticlusterResourceLink.tsx', 'MulticlusterResourceLink-gallery.tsx'],
    ['useWizardInitialValues.ts', 'useWizardInitialValues-gallery.ts'],
    ['useCloseWizard.ts', 'useCloseWizard-gallery.ts'],
    ['useCloneSourceVMs.ts', 'useCloneSourceVMs-gallery.ts'],
    ['useCloneSourceVMColumns.ts', 'useCloneSourceVMColumns-gallery.ts'],
    ['useACMExtensionActions.ts', 'useACMExtensionActions-gallery.ts'],
    ['useFeaturesConfigMap.ts', 'useFeatures-wizard-gallery.ts'],
    ['useAutoAppliedLabels.ts', 'useAutoAppliedLabels-gallery.ts'],
    ['useInstanceTypesAndPreferences.ts', 'useInstanceTypesAndPreferences-gallery.ts'],
    ['useTemplatesWithAvailableSource.ts', 'useWizardTemplatesWithAvailableSource-gallery.ts'],
    ['useIsVMTemplateFeatureEnabled.ts', 'useIsVMTemplateFeatureEnabled-gallery.ts'],
    ['useVMGenerationNavClick.ts', 'useVMGenerationNavClick-gallery.ts'],
    ['useCreateVMFromTemplate.ts', 'useCreateVMFromTemplate-gallery.ts'],
    ['usePreferenceSelectOptions.ts', 'usePreferenceSelectOptions-gallery.ts'],
    ['useOpenShiftTemplates.ts', 'useOpenShiftTemplates-gallery.ts'],
    ['useBootableVolumes.ts', 'useBootableVolumes-gallery.ts'],
  ];

  for (const [suffix, stubFile] of stubBySuffix) {
    if (endsWithStub(request, suffix)) {
      return path.join(stubsDir, stubFile);
    }
  }

  if (request.includes('useFeatures/useFeatures')) {
    return path.join(stubsDir, 'useFeatures-wizard-gallery.ts');
  }

  const stub = resolveGalleryStubModule(request);
  return stub ?? request;
};
