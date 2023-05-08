import React from 'react';

import { CronJobModel } from '@kubevirt-ui/kubevirt-api/console';
import { DetailsTabSectionExtensionHook } from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement } from '@patternfly/react-topology';

import { getResource } from '../../../../utils';
import JobsTabSection from '../JobsTabSection';

const useJobsSideBarTabSection: DetailsTabSectionExtensionHook = (element: GraphElement) => {
  const resource = getResource(element);
  if (!resource || resource.kind !== CronJobModel.kind) {
    return [undefined, true, undefined];
  }
  const section = <JobsTabSection resource={resource} />;
  return [section, true, undefined];
};

export default useJobsSideBarTabSection;
