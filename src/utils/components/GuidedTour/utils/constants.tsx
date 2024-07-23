import React from 'react';
import { Step } from 'react-joyride';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { signal } from '@preact/signals-react';

import AddVolumeContent from '../components/AddVolumeContent/AddVolumeContent';
import EndTourContent from '../components/EndTourContent/EndTourContent';

export const runningTourSignal = signal(false);
export const stepIndexSignal = signal(0);

export const nextStep = () => {
  stepIndexSignal.value++;
};
export const prevStep = () => {
  if (stepIndexSignal.value > 0) {
    --stepIndexSignal.value;
  }
};

export const startTour = () => {
  if (stepIndexSignal.value >= 6) stepIndexSignal.value = 0;
  runningTourSignal.value = true;
};
export const stopTour = () => {
  runningTourSignal.value = false;
};

export const resetTour = () => {
  stepIndexSignal.value = 0;
};

export const tourSteps: Step[] = [
  {
    content: t(
      'Learn more about key areas to complete workflows, increase productivity, and familiarize yourself with Virtualization using our resources.',
    ),
    data: {
      route: '/k8s/all-namespaces/virtualization-overview',
    },
    disableBeacon: true,
    placement: 'bottom',
    target: '#tour-step-resources',
    title: t('Getting started resources'),
  },
  {
    content: t(
      'To create virtual machines in a project, you must first create a new project and become the administrator.',
    ),
    data: { route: '/k8s/all-namespaces/virtualization-overview' },
    disableBeacon: true,
    placement: 'right',
    target: '.co-namespace-dropdown',
    title: t('Project selector'),
  },
  {
    content: t(
      'You can set the cluster and your individual preferences in the Settings tab on the Overview page.',
    ),
    data: { route: '/k8s/all-namespaces/virtualization-overview/settings' },
    disableBeacon: true,
    placement: 'bottom',
    target: '[data-test-id="horizontal-link-Settings"]',
    title: t('Settings configurations'),
  },
  {
    content: <AddVolumeContent />,
    data: { route: '/k8s/all-namespaces/catalog' },
    disableBeacon: false,
    placement: 'bottom',
    target: '#tour-step-add-volume',
    title: t('Add volume'),
  },
  {
    content: t(
      'Before creating a virtual machine, we recommend that you configure the public SSH key. It will be saved in the project as a secret. You can configure the public SSH key at a later time, but this is the easiest way.',
    ),
    data: { route: '/k8s/all-namespaces/catalog' },
    disableBeacon: true,
    placement: 'left-start',
    target: '#tour-step-ssh',
    title: t('Public SSH key'),
  },
  {
    content: t(
      'On the Configuration tab on the VirtualMachine page, you can search for and edit any configurable item using the search box.',
    ),
    data: {
      route: '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine/rhel9-tour-guide/configuration',
    },
    disableBeacon: true,
    placement: 'bottom',
    target: '#VirtualMachineConfigurationTabSearch-autocomplete-search',
    title: t('Search for configurable items'),
  },
  {
    content: <EndTourContent />,
    data: { route: '/k8s/all-namespaces/catalog' },
    disableBeacon: true,
    placement: 'center',
    target: 'body',
    title: t('You are ready to go!'),
  },
];

export const tourGuideVM: V1VirtualMachine = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: {
    name: 'rhel9-tour-guide',
    namespace: 'default',
  },
  spec: {
    dataVolumeTemplates: [
      {
        metadata: {
          name: 'rhel9-volume-tour-guide',
        },
        spec: {
          sourceRef: {
            kind: 'DataSource',
            name: 'rhel9',
          },
          storage: {
            resources: {},
          },
        },
      },
    ],
    instancetype: {
      inferFromVolume: 'rhel9-volume-tour-guide',
    },
    preference: {
      inferFromVolume: 'rhel9-volume-tour-guide',
    },
    runStrategy: 'Always',
    template: {
      spec: {
        domain: {
          devices: {},
          resources: {},
        },
        terminationGracePeriodSeconds: 180,
        volumes: [
          {
            dataVolume: {
              name: 'rhel9-volume-tour-guide',
            },
            name: 'rhel9-volume-tour-guide',
          },
        ],
      },
    },
  },
};
