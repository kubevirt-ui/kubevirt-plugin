export const NO_DATA_DASH = '-';

export const MILLISECONDS_TO_SECONDS_MULTIPLIER = 1000;

export const PATHS_TO_HIGHLIGHT = {
  DEFAULT: ['spec.template.spec.domain.devices.disks', 'spec.template.spec.volumes'],
  DETAILS_TAB: [
    'spec.template.metadata.annotations',
    'spec.template.metadata.labels',
    'spec.template.spec.domain.cpu',
    'spec.template.spec.domain.memory.guest',
    'metadata.labels',
    'metadata.annotations',
  ],
  DISKS_TAB: ['spec.template.spec.domain.devices.disks', 'spec.template.spec.volumes'],
  ENV_TAB: ['spec.template.spec.domain.devices.disks', 'spec.template.spec.volumes'],
  NETWORK_TAB: ['spec.template.spec.networks', 'spec.template.spec.domain.devices.interfaces'],
  SCHEDULING_TAB: [
    'spec.template.spec.affinity',
    'spec.template.spec.tolerations',
    'spec.template.spec.nodeSelector',
    'spec.template.metadata.annotations',
  ],
  SCRIPTS_TAB: ['spec.template.spec.volumes', 'spec.template.spec.accessCredentials'],
};

export const MIGRATION__PROMETHEUS_DELAY = 15 * MILLISECONDS_TO_SECONDS_MULTIPLIER;
