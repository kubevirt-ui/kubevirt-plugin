import React, { FC } from 'react';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import TopologySideBarTabSection from '../../side-bar/TopologySideBarTabSection';
import JobsOverview from '../JobOverview/JobsOverview';

import useJobsForCronJobWatcher from './hooks/useJobsForCronJobWatcher';

type JobsTabSectionProps = {
  resource: K8sResourceCommon;
};

const JobsTabSection: FC<JobsTabSectionProps> = ({ resource }) => {
  const { jobs } = useJobsForCronJobWatcher(resource);
  return (
    <TopologySideBarTabSection>
      <JobsOverview obj={resource} jobs={jobs} />
    </TopologySideBarTabSection>
  );
};

export default JobsTabSection;
