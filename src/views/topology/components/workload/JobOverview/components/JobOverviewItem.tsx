import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';
import { ChartLabel } from '@patternfly/react-charts';

import { resourcePath } from '../../../../../cdi-upload-provider/utils/utils';
import { JobKind } from '../../../../utils/hooks/useBuildsConfigWatcher/utils/types';
import usePodsWatcher from '../../../../utils/hooks/usePodsWatcher/usePodsWatcher';
import PodStatus from '../../../graph-view/components/nodes/PodStatus/PodStatus';

type JobOverviewItemProps = {
  job: JobKind;
};

const kind = 'Job';

const JobOverviewItem: FC<JobOverviewItemProps> = ({ job }) => {
  const {
    metadata: { name, namespace },
  } = job;
  const podsLink = `${resourcePath(getK8sModel(job), name, namespace)}/pods`;
  const { podData, loaded, loadError } = usePodsWatcher(job, 'Job', namespace);

  return loaded && !loadError ? (
    <li className="list-group-item container-fluid">
      <div className="job-overview__item">
        <ResourceLink kind={kind} name={name} namespace={namespace} />
        <Link to={podsLink} className="overview__pod-donut-sm">
          <PodStatus
            standalone
            data={podData.pods}
            size={25}
            innerRadius={8}
            outerRadius={12}
            title={`${podData.pods.length}`}
            titleComponent={<ChartLabel style={{ fontSize: '10px' }} />}
            showTooltip={false}
          />
        </Link>
      </div>
    </li>
  ) : null;
};

export default JobOverviewItem;
