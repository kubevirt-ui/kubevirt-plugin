declare interface Window {
  SERVER_FLAGS: {
    authDisabled: boolean;
    branding: string;
    nodeArchitectures?: string[];

    telemetry?: {
      DEVSANDBOX_SEGMENT_API_KEY: string;
      // All of the following should be always available on prod env.
      SEGMENT_API_HOST: string;

      // One of the following should be always available on prod env.
      SEGMENT_API_KEY: string;
      SEGMENT_JS_HOST: string;
      // Optional override for analytics.min.js script URL
      SEGMENT_JS_URL: string;

      SEGMENT_PUBLIC_API_KEY: string;
    };
  };
}

// TODO: React 18 FC type no longer supports optional children, so we use custom FCC type
// (FC with Children) as a temporary workaround. Long term, all React components that use
// children should have their Props types updated, e.g. use explicit children?: ReactNode
import 'react';
declare module 'react' {
  /** @deprecated Replace with `FC<P>` where `P` reflects the expected `children` usage. */
  type FCC<P = {}> = FC<PropsWithChildren<P>>;
}

import 'i18next';
declare module 'i18next' {
  /** @see https://www.i18next.com/overview/typescript#custom-type-options */
  interface CustomTypeOptions {
    allowObjectInHTMLChildren: true;
  }
}
