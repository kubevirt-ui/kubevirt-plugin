import type { TFunction } from 'i18next';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';

import { getEffectivePanicDevices, getPanicDeviceDisplayState } from './helpers';

const t = ((key: string) => key) as TFunction;

const createVM = (osAnnotation?: string): V1VirtualMachine => ({
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: { name: 'test-vm' },
  spec: {
    template: {
      metadata: osAnnotation
        ? {
            annotations: {
              [ANNOTATIONS.os]: osAnnotation,
            },
          }
        : undefined,
      spec: {
        domain: {
          devices: {},
        },
      },
    },
  },
});

const baseDisplayArgs = {
  configuredPanicDevices: undefined as undefined,
  hasPanicFromMetric: undefined as boolean | undefined,
  inferFromPreference: false,
  metricLoaded: true,
  panicDevices: undefined as undefined,
  preferenceError: undefined as Error | undefined,
  preferenceLoading: false,
  t,
  vm: createVM(),
};

describe('getEffectivePanicDevices', () => {
  it('should return configured devices when present', () => {
    const configured = [{ model: 'hyperv' }];
    expect(getEffectivePanicDevices(configured, 'pvpanic')).toEqual(configured);
  });

  it('should fall back to preferred model when configured devices are empty', () => {
    expect(getEffectivePanicDevices([], 'pvpanic')).toEqual([{ model: 'pvpanic' }]);
    expect(getEffectivePanicDevices(undefined, 'hyperv')).toEqual([{ model: 'hyperv' }]);
  });

  it('should return the empty/undefined configured value when no preferred model', () => {
    expect(getEffectivePanicDevices([])).toEqual([]);
    expect(getEffectivePanicDevices(undefined)).toBeUndefined();
  });

  it('should not fall back to preferred model for incomplete placeholder entries', () => {
    expect(getEffectivePanicDevices([{}], 'pvpanic')).toEqual([{}]);
  });
});

describe('getPanicDeviceDisplayState', () => {
  describe('status text', () => {
    it('should show joined models when devices have models', () => {
      const { statusText } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        panicDevices: [{ model: 'hyperv' }, { model: 'pvpanic' }],
      });

      expect(statusText).toBe('hyperv, pvpanic');
    });

    it('should show Absent when devices exist without models', () => {
      const { isPending, statusText } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        metricLoaded: false,
        panicDevices: [{}],
      });

      expect(isPending).toBe(false);
      expect(statusText).toBe('Absent');
    });

    it('should show Absent when model is an empty string', () => {
      const { statusText } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        panicDevices: [{ model: '' }],
      });

      expect(statusText).toBe('Absent');
    });

    it('should show preferred model when inferring from preference', () => {
      const { showWindowsWarning, statusText } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        inferFromPreference: true,
        panicDevices: [{ model: 'hyperv' }],
        vm: createVM('windows10'),
      });

      expect(statusText).toBe('hyperv');
      expect(showWindowsWarning).toBe(false);
    });

    it('should show Absent when devices list is empty', () => {
      expect(
        getPanicDeviceDisplayState({
          ...baseDisplayArgs,
          panicDevices: [],
        }).statusText,
      ).toBe('Absent');
    });

    it('should show Absent when devices are missing', () => {
      expect(getPanicDeviceDisplayState(baseDisplayArgs).statusText).toBe('Absent');
    });

    it('should show Absent when devices are empty even if metric reports present', () => {
      const { statusText } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        hasPanicFromMetric: true,
        panicDevices: [],
      });

      expect(statusText).toBe('Absent');
    });

    it('should be pending while preference is loading', () => {
      const { isPending, statusText } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        inferFromPreference: true,
        preferenceLoading: true,
      });

      expect(isPending).toBe(true);
      expect(statusText).toBe('Absent');
    });

    it('should be pending while metric is loading and devices are empty', () => {
      const { isPending, statusText } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        metricLoaded: false,
      });

      expect(isPending).toBe(true);
      expect(statusText).toBe('Absent');
    });

    it('should show Unavailable when preference fails and devices are empty', () => {
      const { statusText } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        inferFromPreference: true,
        preferenceError: new Error('not found'),
      });

      expect(statusText).toBe('Unavailable');
    });
  });

  describe('Windows warning', () => {
    const windowsVM = createVM('windows10');

    it('should show warning for Windows VM without panic devices', () => {
      const { showWindowsWarning } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        vm: windowsVM,
      });

      expect(showWindowsWarning).toBe(true);
    });

    it('should hide warning when devices are configured', () => {
      const { showWindowsWarning } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        panicDevices: [{ model: 'hyperv' }],
        vm: windowsVM,
      });

      expect(showWindowsWarning).toBe(false);
    });

    it('should show warning when devices have no models', () => {
      const { showWindowsWarning, statusText } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        panicDevices: [{}],
        vm: windowsVM,
      });

      expect(statusText).toBe('Absent');
      expect(showWindowsWarning).toBe(true);
    });

    it('should hide warning when metric reports present', () => {
      const { showWindowsWarning } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        hasPanicFromMetric: true,
        panicDevices: [],
        vm: windowsVM,
      });

      expect(showWindowsWarning).toBe(false);
    });

    it('should hide warning while pending', () => {
      const { showWindowsWarning } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        metricLoaded: false,
        vm: windowsVM,
      });

      expect(showWindowsWarning).toBe(false);
    });

    it('should hide warning when preference is unavailable', () => {
      const { showWindowsWarning } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        inferFromPreference: true,
        preferenceError: new Error('not found'),
        vm: windowsVM,
      });

      expect(showWindowsWarning).toBe(false);
    });

    it('should hide warning for non-Windows VMs', () => {
      const { showWindowsWarning } = getPanicDeviceDisplayState({
        ...baseDisplayArgs,
        vm: createVM('rhel9'),
      });

      expect(showWindowsWarning).toBe(false);
    });
  });
});
