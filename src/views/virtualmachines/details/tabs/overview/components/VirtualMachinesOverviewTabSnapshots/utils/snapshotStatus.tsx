import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon, UnknownIcon } from '@patternfly/react-icons';

const iconHandler = {
  get: (mapper: typeof iconMapper, prop: string) => {
    const icon = mapper[prop?.toLowerCase()];
    if (icon) return icon;
    return InProgressIcon;
  },
};

const iconMapper: { [key: string]: any } = {
  error: RedExclamationCircleIcon,
  failed: RedExclamationCircleIcon,
  succeeded: GreenCheckCircleIcon,
  unknown: UnknownIcon,
};

export const icon = new Proxy<typeof iconMapper>(iconMapper, iconHandler);
