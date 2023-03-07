export const NO_DATA_DASH = '-';

export const MILLISECONDS_TO_SECONDS_MULTIPLIER = 1000;

export const PATHS_TO_HIGHLIGHT = {
  DETAILS_TAB: [
    'spec.template.metadata.annotations',
    'spec.template.metadata.labels',
    'spec.template.spec.domain.cpu',
    'spec.template.spec.domain.resources.requests',
    'metadata.labels',
    'metadata.annotations',
  ],
  ENV_TAB: ['spec.template.spec.domain.devices.disks', 'spec.template.spec.volumes'],
  DISKS_TAB: ['spec.template.spec.domain.devices.disks', 'spec.template.spec.volumes'],
  NETWORK_TAB: ['spec.template.spec.networks', 'spec.template.spec.domain.devices.interfaces'],
  SCHEDULING_TAB: [
    'spec.template.spec.affinity',
    'spec.template.spec.tolerations',
    'spec.template.spec.nodeSelector',
    'spec.template.metadata.annotations',
  ],
  SCRIPTS_TAB: ['spec.template.spec.volumes', 'spec.template.spec.accessCredentials'],
  DEFAULT: ['spec.template.spec.domain.devices.disks', 'spec.template.spec.volumes'],
};
