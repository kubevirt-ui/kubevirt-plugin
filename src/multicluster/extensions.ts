import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

import { acmExtensions } from './extensions/acmExtensions';
import { checkupRouteExtensions } from './extensions/checkupRouteExtensions';
import { migrationRouteExtensions } from './extensions/migrationRouteExtensions';
import { navigationExtensions, perspectiveExtension } from './extensions/navigationExtensions';
import { templateRouteExtensions } from './extensions/templateRouteExtensions';
import { vmRouteExtensions } from './extensions/vmRouteExtensions';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  acmFlags: './multicluster/flags.ts',
  CrossClusterMigration:
    './multicluster/components/CrossClusterMigration/CrossClusterMigration.tsx',
  MulticlusterYAMLCreation:
    './multicluster/components/MulticlusterYAMLCreation/MulticlusterYAMLCreation.tsx',
  urls: './multicluster/urls.ts',
};

export const extensions: EncodedExtension[] = [
  perspectiveExtension,
  ...navigationExtensions,
  ...vmRouteExtensions,
  ...templateRouteExtensions,
  ...migrationRouteExtensions,
  ...acmExtensions,
  ...checkupRouteExtensions,
];
