import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { createVMFlowTypes } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getSegmentAnalytics } from '@openshift-console/dynamic-plugin-sdk-internal';

export const eventMonitor = (eventType: string, properties?: any) => {
  if (typeof getSegmentAnalytics !== 'function') {
    return;
  }

  const segmentAnalytics = getSegmentAnalytics();

  if (!segmentAnalytics?.analyticsEnabled) {
    kubevirtConsole.warn('Analytics not enabled, ignoring telemetry event', eventType, properties);
    return;
  }

  segmentAnalytics.analytics.track(eventType, properties);
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
