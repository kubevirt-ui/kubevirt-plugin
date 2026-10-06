import type { Compiler } from '@rspack/core';

import { resolveGalleryRequest } from './gallery-resolve';

/** Redirect console-host and SDK imports to gallery stubs (same rules as the former Vite plugin). */
export class GalleryDepsRspackPlugin {
  apply(compiler: Compiler): void {
    compiler.hooks.normalModuleFactory.tap('GalleryDepsRspackPlugin', (normalModuleFactory) => {
      normalModuleFactory.hooks.beforeResolve.tap('GalleryDepsRspackPlugin', (resolveData) => {
        if (!resolveData?.request) {
          return;
        }

        resolveData.request = resolveGalleryRequest(resolveData.request);
      });
    });
  }
}
