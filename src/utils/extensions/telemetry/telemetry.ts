import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { createVMFlowTypes } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

// Segment "apiHost" parameter, should be like "api.segment.io/v1"
const apiHost = window.SERVER_FLAGS.telemetry?.SEGMENT_API_HOST || '';

// Segment JS host, defaults to "cdn.segment.com" if not defined
const jsHost = window.SERVER_FLAGS.telemetry?.SEGMENT_JS_HOST || 'cdn.segment.com';

// Segment API key, should look like a hash
const apiKey =
  window.SERVER_FLAGS.telemetry?.SEGMENT_API_KEY ||
  window.SERVER_FLAGS.telemetry?.SEGMENT_PUBLIC_API_KEY ||
  window.SERVER_FLAGS.telemetry?.DEVSANDBOX_SEGMENT_API_KEY ||
  '';

// Segment analytics.min.js script URL
const jsURL =
  window.SERVER_FLAGS.telemetry?.SEGMENT_JS_URL ||
  `https://${jsHost}/analytics.js/v1/${encodeURIComponent(apiKey)}/analytics.min.js`;

const initSegment = () => {
  const analytics = ((window as any).analytics = (window as any).analytics || []);
  if (analytics.initialize) {
    return;
  }

  if (analytics.invoked) {
    kubevirtConsole.error('Segment snippet included twice');
    return;
  }

  analytics.invoked = true;
  analytics.methods = [
    'trackSubmit',
    'trackClick',
    'trackLink',
    'trackForm',
    'pageview',
    'identify',
    'reset',
    'group',
    'track',
    'ready',
    'alias',
    'debug',
    'page',
    'once',
    'off',
    'on',
    'addSourceMiddleware',
    'addIntegrationMiddleware',
    'setAnonymousId',
    'addDestinationMiddleware',
  ];
  analytics.factory = function (e: string) {
    return function () {
      // eslint-disable-next-line prefer-rest-params
      const t = Array.prototype.slice.call(arguments);
      t.unshift(e);
      analytics.push(t);
      return analytics;
    };
  };
  for (const key of analytics.methods) {
    analytics[key] = analytics.factory(key);
  }
  analytics.load = function (_key: string, e: Event) {
    const t = document.createElement('script');
    t.type = 'text/javascript';
    t.async = true;
    t.src = jsURL;
    const n = document.getElementsByTagName('script')[0];
    if (n.parentNode) {
      n.parentNode.insertBefore(t, n);
    }
    analytics._loadOptions = e;
  };
  analytics.SNIPPET_VERSION = '4.13.1';
  const options: Record<string, any> = {};
  if (apiHost) {
    options.integrations = { 'Segment.io': { apiHost } };
  }
  analytics.load(apiKey, options);
};

if (apiKey) {
  initSegment();
}

export const eventMonitor = async (eventType: string, properties?: any) => {
  if (!apiKey) {
    kubevirtConsole.warn(
      'Segment API key not available, ignoring telemetry event',
      eventType,
      properties,
    );
    return;
  }
  const anonymousIP = {
    context: {
      ip: '0.0.0.0',
    },
  };
  switch (eventType) {
    case 'identify': {
      const { user, ...otherProperties } = properties;
      // With 4.15+ we can use the user object directly, but on older releases (<4.15)
      // we need to extract the user object from the metadata.
      // All properties are defined in the UserInfo interface and marked as optional.
      const uid = user?.uid || user?.metadata?.uid;
      const username = user?.username || user?.metadata?.name;
      const id = uid || `${location.host}-${username}`;
      // Use SHA1 hash algorithm to anonymize the user
      const anonymousIdBuffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(id));
      const anonymousIdArray = Array.from(new Uint8Array(anonymousIdBuffer));
      const anonymousId = anonymousIdArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      (window as any).analytics.identify(anonymousId, otherProperties, anonymousIP);
      break;
    }
    case 'page': {
      (window as any).analytics.page(undefined, properties, anonymousIP);
      break;
    }
    default: {
      (window as any).analytics.track(eventType, properties, anonymousIP);
    }
  }
};

export const logEventWithName = (
  key: string,
  vm?: V1VirtualMachine,
  properties?: Record<string, any>,
) => {
  eventMonitor(key, {
    ...properties,
    ...(vm && { vmName: getName(vm) }),
  });
};

export const logITFlowEvent = (
  key: string,
  vm?: V1VirtualMachine,
  properties?: Record<string, any>,
) => logEventWithName(key, vm, { ...properties, flow: createVMFlowTypes.InstanceTypes });

export const logTemplateFlowEvent = (
  key: string,
  template: V1Template,
  properties?: Record<string, any>,
) =>
  eventMonitor(key, {
    ...properties,
    flow: createVMFlowTypes.Template,
    templateName: getName(template),
  });
