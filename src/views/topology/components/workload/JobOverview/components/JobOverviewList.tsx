import React, { FC } from 'react';

import { JobKind } from '../../../../utils/hooks/useBuildsConfigWatcher/utils/types';

import JobOverviewItem from './JobOverviewItem';

type JobsOverviewListProps = {
  jobs: JobKind[];
};

const JobsOverviewList: FC<JobsOverviewListProps> = ({ jobs }) => (
  <ul className="list-group">
    {jobs?.map((job) => (
      <JobOverviewItem key={job.metadata.uid} job={job} />
    ))}
  </ul>
);

export default JobsOverviewList;
