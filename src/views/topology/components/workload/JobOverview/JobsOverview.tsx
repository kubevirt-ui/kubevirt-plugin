import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';

import { resourcePath } from '../../../../cdi-upload-provider/utils/utils';
import { JobKind } from '../../../utils/hooks/useBuildsConfigWatcher/utils/types';

import JobsOverviewList from './components/JobOverviewList';
import SidebarSectionHeading from './components/SidebarSectionHeading';

type JobsOverviewProps = {
  jobs: JobKind[];
  obj: K8sResourceCommon;
  allJobsLink?: string;
  emptyText?: string;
};

const MAX_JOBS = 3;

const JobsOverview: FC<JobsOverviewProps> = ({ jobs, obj, allJobsLink, emptyText }) => {
  const {
    metadata: { name, namespace },
  } = obj;
  const { t } = useTranslation();
  const linkTo = allJobsLink || `${resourcePath(getK8sModel(obj), name, namespace)}/jobs`;
  const emptyMessage = emptyText || t('kubevirt-plugin~No Jobs found for this resource.');

  return (
    <>
      <SidebarSectionHeading text="Jobs">
        {jobs?.length > MAX_JOBS && (
          <Link className="sidebar__section-view-all" to={linkTo}>
            {t('kubevirt-plugin~View all ({{jobCount}})', { jobCount: jobs.length })}
          </Link>
        )}
      </SidebarSectionHeading>
      {!(jobs?.length > 0) ? (
        <span className="text-muted">{emptyMessage}</span>
      ) : (
        <JobsOverviewList jobs={jobs.slice(0, MAX_JOBS)} />
      )}
    </>
  );
};

export default JobsOverview;
