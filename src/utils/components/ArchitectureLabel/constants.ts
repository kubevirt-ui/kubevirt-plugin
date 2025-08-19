import { LabelProps } from '@patternfly/react-core';

const ARCHITECUTRE_COLORS: Record<string, LabelProps['color']> = {
  amd64: 'blue',
  arm64: 'green',
  s390x: 'purple',
};

export const getArchitectureLabelColor = (architecture: string): LabelProps['color'] => {
  if (!architecture || !ARCHITECUTRE_COLORS[architecture]) {
    return 'orange';
  }

  return ARCHITECUTRE_COLORS[architecture];
};
