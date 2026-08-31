import { type V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export const DEFAULT_CPU: V1CPU = {
  cores: 1,
  sockets: 1,
  threads: 1,
};
