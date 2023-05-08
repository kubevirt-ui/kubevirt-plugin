import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { isEmpty, size, take } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import { K8sResourceKind } from '../../../clusteroverview/utils/types';
import SidebarSectionHeading from '../workload/JobOverview/components/SidebarSectionHeading';

import TopologyApplicationResourceList from './TopologyApplicationList';

const MAX_RESOURCES = 5;

export type ApplicationGroupResourceProps = {
  title: string;
  resourcesData: K8sResourceKind[];
  group: string;
};

const ApplicationGroupResource: React.FC<ApplicationGroupResourceProps> = ({
  title,
  resourcesData,
  group,
}) => {
  const { t } = useTranslation();
  const [activeNamespace] = useActiveNamespace();
  return !isEmpty(resourcesData) ? (
    <div className="overview__sidebar-pane-body">
      <SidebarSectionHeading text={title}>
        {size(resourcesData) > MAX_RESOURCES && (
          <Link
            className="sidebar__section-view-all"
            to={`/search/ns/${activeNamespace}?kind=${referenceFor(
              resourcesData[0],
            )}&q=${encodeURIComponent(`app.kubernetes.io/part-of=${group}`)}`}
          >
            {t('kubevirt-plugin~View all {{size}}', { size: size(resourcesData) })}
          </Link>
        )}
      </SidebarSectionHeading>
      <TopologyApplicationResourceList resources={take(resourcesData, MAX_RESOURCES)} />
    </div>
  ) : null;
};

export default ApplicationGroupResource;
