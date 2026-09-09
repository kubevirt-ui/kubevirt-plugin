import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { createVMFlowTypes } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { TELEMETRY_UNKNOWN_ERROR_MESSAGE } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { type Template } from '@kubevirt-utils/resources/template';
import { getErrorMessage, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getSegmentAnalytics } from '@openshift-console/dynamic-plugin-sdk-internal';

export const eventMonitor = (eventType: string, properties?: Record<string, unknown>): void => {
  if (typeof getSegmentAnalytics !== 'function') {
    return;
  }

  const segmentAnalytics = getSegmentAnalytics();

  if (!segmentAnalytics?.analyticsEnabled) {
    kubevirtConsole.warn('Analytics not enabled, ignoring telemetry event', eventType, properties);
    return;
  }

  const payload = properties
    ? Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined))
    : undefined;

  segmentAnalytics.analytics.track(eventType, payload);
};

export const getTelemetryErrorMessage = (error: unknown): string =>
  getErrorMessage(error) ?? TELEMETRY_UNKNOWN_ERROR_MESSAGE;

export const logEventWithName = (
  key: string,
  properties?: Record<string, unknown>,
  vm?: V1VirtualMachine,
): void => {
  eventMonitor(key, {
    ...properties,
    ...(vm && { vmName: getName(vm) }),
  });
};

export const logITFlowEvent = (
  key: string,
  vm?: V1VirtualMachine,
  properties?: Record<string, unknown>,
): void => logEventWithName(key, { ...properties, flow: createVMFlowTypes.InstanceTypes }, vm);

export const logTemplateFlowEvent = (
  key: string,
  template: Template,
  properties?: Record<string, unknown>,
): void =>
  eventMonitor(key, {
    ...properties,
    flow: createVMFlowTypes.Template,
    templateName: getName(template),
  });

export const logCreationFailed = (eventName: string, error: unknown): void => {
  logEventWithName(eventName, {
    errorMessage: getTelemetryErrorMessage(error),
  });
};
