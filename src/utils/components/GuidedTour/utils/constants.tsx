import React from 'react';
import { Step } from 'react-joyride';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { RUNSTRATEGY_ALWAYS } from '@kubevirt-utils/constants/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TREE_VIEW_PANEL_ID } from '@virtualmachines/tree/utils/constants';

import AddVolumeContent from '../components/AddVolumeContent/AddVolumeContent';
import EndTourContent from '../components/EndTourContent/EndTourContent';
import NewStepTitle from '../components/NewStepTitle/NewStepTitle';

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
      'To create VirtualMachines in a project, you must first create a new project and become the administrator.',
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
    content: t(
      'Visualize all your VirtualMachines and easily navigate between them using the tree view. You can also see their details with a status summary.',
    ),
    data: { route: '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine' },
    disableBeacon: true,
    placement: 'right',
    target: `#${TREE_VIEW_PANEL_ID}`,
    title: <NewStepTitle title={t('Tree view')} />,
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
      route: '/k8s/ns/default/kubevirt.io~v1~VirtualMachine/rhel9-tour-guide/configuration',
    },
    disableBeacon: true,
    placement: 'bottom',
    target: '#ConfigurationSearch-autocomplete-search',
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
    runStrategy: RUNSTRATEGY_ALWAYS,
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
