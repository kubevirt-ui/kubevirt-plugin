import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { createVMFlowTypes } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

const SEGMENT_KEY =
  (window as any).SERVER_FLAGS?.telemetry?.DEVSANDBOX_SEGMENT_API_KEY ||
  (window as any).SERVER_FLAGS?.telemetry?.SEGMENT_API_KEY ||
  (window as any).SERVER_FLAGS?.telemetry?.SEGMENT_PUBLIC_API_KEY ||
  '';

const initSegment = () => {
  const analytics = ((window as any).analytics = (window as any).analytics || []);
  if (analytics.initialize) {
    return;
  }

  if (analytics.invoked)
    window.console &&
      kubevirtConsole.error &&
      kubevirtConsole.error('Segment snippet included twice.');
  else {
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
      return function (...args) {
        const t = Array.prototype.slice.call(args);
        t.unshift(e);
        analytics.push(t);
        return analytics;
      };
    };
    for (let e = 0; e < analytics.methods.length; e++) {
      const key = analytics.methods[e];
      analytics[key] = analytics.factory(key);
    }
    analytics.load = function (key: string, e: Event) {
      const t = document.createElement('script');
      t.type = 'text/javascript';
      t.async = true;
      t.src =
        'https://cdn.segment.com/analytics.js/v1/' + encodeURIComponent(key) + '/analytics.min.js';
      const n = document.getElementsByTagName('script')[0];
      if (n.parentNode) {
        n.parentNode.insertBefore(t, n);
      }
      analytics._loadOptions = e;
    };
    analytics.SNIPPET_VERSION = '4.13.1';
    if (SEGMENT_KEY) {
      analytics.load(SEGMENT_KEY);
    }
  }
};

initSegment();

export const eventMonitor = async (eventType: string, properties?: any) => {
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
) => logEventWithName(key, vm, { ...properties, flow: createVMFlowTypes.IT });

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
