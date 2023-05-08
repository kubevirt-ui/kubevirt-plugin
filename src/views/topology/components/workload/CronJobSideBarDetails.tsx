import React from 'react';
import { useTranslation } from 'react-i18next';

import { DetailsItem, ResourceSummary, Timestamp } from '@console/internal/components/hooks';
import { CronJobModel } from '@console/internal/models';
import { CronJobKind } from '@console/internal/module/k8s';
import PodRingSet from '@console/shared/src/components/pod/PodRingSet';
import { DetailsTabSectionExtensionHook } from '@openshift-console/dynamic-plugin-sdk/src/extensions/topology-details';
import { GraphElement } from '@patternfly/react-topology';

import { getResource } from '../../utils';

type CronJobSideBarDetailsProps = {
  cronjob: CronJobKind;
};

const CronJobSideBarDetails: React.FC<CronJobSideBarDetailsProps> = ({ cronjob }) => {
  const { t } = useTranslation();

  return (
    <div className="overview__sidebar-pane-body resource-overview__body">
      <div className="resource-overview__pod-counts">
        <PodRingSet key={cronjob.metadata.uid} obj={cronjob} path="" />
      </div>
      <ResourceSummary resource={cronjob} showPodSelector>
        <DetailsItem label={t('kubevirt-plugin~Schedule')} obj={cronjob} path="spec.schedule" />
        <DetailsItem
          label={t('kubevirt-plugin~Concurrency policy')}
          obj={cronjob}
          path="spec.concurrencyPolicy"
        />
        <DetailsItem
          label={t('kubevirt-plugin~Starting deadline seconds')}
          obj={cronjob}
          path="spec.startingDeadlineSeconds"
        >
          {cronjob.spec.startingDeadlineSeconds
            ? t('kubevirt-plugin~second', { count: cronjob.spec.startingDeadlineSeconds })
            : t('kubevirt-plugin~Not configured')}
        </DetailsItem>
        <DetailsItem
          label={t('kubevirt-plugin~Last schedule time')}
          obj={cronjob}
          path="status.lastScheduleTime"
        >
          <Timestamp timestamp={cronjob.status.lastScheduleTime} />
        </DetailsItem>
      </ResourceSummary>
    </div>
  );
};

export const useCronJobSideBarDetails: DetailsTabSectionExtensionHook = (element: GraphElement) => {
  const resource = getResource<CronJobKind>(element);
  if (!resource || resource.kind !== CronJobModel.kind) {
    return [undefined, true, undefined];
  }
  const section = <CronJobSideBarDetails cronjob={resource} />;
  return [section, true, undefined];
};
