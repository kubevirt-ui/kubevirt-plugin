import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  AddAction,
  ContextProvider,
  DashboardsOverviewHealthPrometheusSubsystem,
  FeatureFlag,
  FeatureFlagHookProvider,
  RoutePage,
  StandaloneRoutePage,
  TelemetryListener,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ConsoleStandAlone: './utils/components/Consoles/ConsoleStandAlone.tsx',
  dashboardExtensions: './utils/extensions/dashboard/index.ts',
  HardwareDevicesPage: './utils/components/HardwareDevices/HardwareDevicesPage.tsx',
  icons: './utils/icons.tsx',
  kubevirtFlags: './utils/flags',
  modalProvider: './utils/components/ModalProvider/ModalProvider.tsx',
  telemetry: 'src/utils/extensions/telemetry/telemetry.ts',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      provider: { $codeRef: 'modalProvider.ModalProvider' },
      useValueHook: { $codeRef: 'modalProvider.useModalValue' },
    },
    type: 'console.context-provider',
  } as EncodedExtension<ContextProvider>,

  {
    properties: {
      handler: { $codeRef: 'kubevirtFlags.enableKubevirtDynamicFlag' },
    },
    type: 'console.flag',
  } as EncodedExtension<FeatureFlag>,
  {
    properties: { handler: { $codeRef: 'kubevirtFlags.useEnableKubevirtMenuFlags' } },
    type: 'console.flag/hookProvider',
  } as EncodedExtension<FeatureFlagHookProvider>,

  {
    properties: {
      description: '%plugin__kubevirt-plugin~Create a Virtual Machine from a template%',
      groupId: 'developer-catalog',
      href: '/k8s/ns/:namespace/catalog/template',
      icon: { $codeRef: 'icons.vmIconElement' },
      id: 'dev-catalog-virtualization',
      label: '%plugin__kubevirt-plugin~Virtual Machines%',
    },
    type: 'dev-console.add/action',
  } as EncodedExtension<AddAction>,

  {
    properties: {
      component: {
        $codeRef: 'HardwareDevicesPage',
      },
      path: ['/hardwaredevices'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,

  {
    properties: {
      healthHandler: {
        $codeRef: 'dashboardExtensions.getKubevirtHealthState',
      },
      name: '%plugin__kubevirt-plugin~OpenShift Virtualization%',
      popupComponent: { $codeRef: 'dashboardStatus.default' },
      popupTitle: '%plugin__kubevirt-plugin~OpenShift Virtualization%',
      queries: ['kubevirt_hyperconverged_operator_health_status'],
      title: '%plugin__kubevirt-plugin~OpenShift Virtualization%',
    },
    type: 'console.dashboards/overview/health/prometheus',
  } as EncodedExtension<DashboardsOverviewHealthPrometheusSubsystem>,
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      component: { $codeRef: 'ConsoleStandAlone' },
      exact: false,
      path: ['/k8s/ns/:ns/kubevirt.io~v1~VirtualMachine/:name/console/standalone'],
    },
    type: 'console.page/route/standalone',
  } as EncodedExtension<StandaloneRoutePage>,

  {
    properties: {
      listener: {
        $codeRef: 'telemetry.eventMonitor',
      },
    },
    type: 'console.telemetry/listener',
  } as EncodedExtension<TelemetryListener>,
];
