import React from 'react';
import { Step } from 'react-joyride';
import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { RUNSTRATEGY_ALWAYS } from '@kubevirt-utils/resources/vm/utils/constants';

import EndTourContent from '../components/EndTourContent/EndTourContent';
import PowerfulShortcutsContent from '../components/PowerfulShortcutsContent/PowerfulShortcutsContent';

const TOUR_GUIDE_VM_NAMESPACE = 'default';
const TOUR_GUIDE_VM_NAME = 'rhel9-tour-guide';
export const TOUR_GUIDE_VM_TREE_ID = `${SINGLE_CLUSTER_KEY}/${TOUR_GUIDE_VM_NAMESPACE}/${TOUR_GUIDE_VM_NAME}`;

const VM_LIST_ROUTE = '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine';

export const getTourSteps = (t: TFunction): Step[] => [
  {
    content: t('Right-click a cluster in the sidebar to start organizing your workspace.'),
    data: { route: VM_LIST_ROUTE },
    disableBeacon: true,
    placement: 'right',
    spotlightPadding: 4,
    target: `[id="${ALL_NAMESPACES_SESSION_KEY}"] > div`,
    title: t('Create a new project'),
  },
  {
    content: <PowerfulShortcutsContent />,
    data: { route: VM_LIST_ROUTE },
    disableBeacon: true,
    placement: 'right',
    target: `[id="${TOUR_GUIDE_VM_TREE_ID}"]`,
    title: t('Powerful VM shortcuts'),
  },
  {
    content: t('Get a high-level summary of your current view, including VM health and alerts.'),
    data: { route: VM_LIST_ROUTE },
    disableBeacon: true,
    placement: 'bottom',
    target: '[data-test="overview-tab"]',
    title: t('Overview tab'),
  },
  {
    content: t('Monitor and manage all of your VMs right here.'),
    data: { route: VM_LIST_ROUTE },
    disableBeacon: true,
    placement: 'bottom',
    target: '[data-test="vm-list-tab"]',
    title: t('Virtual machines tab'),
  },
  {
    content: t(
      'Choose to create a VM from a guided flow or from the YAML. You can also create a VM directly from the side navigation by right-clicking in any project.',
    ),
    data: { route: VM_LIST_ROUTE },
    disableBeacon: true,
    placement: 'bottom',
    spotlightPadding: 12,
    target: '#tour-step-create-button',
    title: t('Create a VM'),
  },
  {
    content: <EndTourContent />,
    data: { route: VM_LIST_ROUTE },
    disableBeacon: true,
    placement: 'center',
    target: 'body',
    title: t("You're all set!"),
  },
];

export const TOUR_STEPS_COUNT = getTourSteps(((key: string) => key) as TFunction).length;

export const tourGuideVM: V1VirtualMachine = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: {
    name: TOUR_GUIDE_VM_NAME,
    namespace: TOUR_GUIDE_VM_NAMESPACE,
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
