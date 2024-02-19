import React, { FC } from 'react';

import {
  JobModel,
  modelToGroupVersionKind,
  NamespaceModel,
  NetworkAttachmentDefinitionModelGroupVersionKind,
  NodeModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem, Title } from '@patternfly/react-core';

import CheckupsNetworkStatusIcon from '../../CheckupsNetworkStatusIcon';
import {
  STATUS_COMPILATION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
} from '../../utils/utils';
import {
  STATUS_AVG_LATENCY_NANO,
  STATUS_MAX_LATENCY_NANO,
  STATUS_MIN_LATENCY_NANO,
  STATUS_NAD_NAME,
  STATUS_NAD_NAMESPACE,
  STATUS_SAMPLE_DURATION,
  STATUS_SOURCE_NODE,
  STATUS_TARGET_NODE,
} from '../utils/utils';

type CheckupsNetworkDetailsPageSectionProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  job: IoK8sApiBatchV1Job;
};

const CheckupsNetworkDetailsPageSection: FC<CheckupsNetworkDetailsPageSectionProps> = ({
  configMap,
  job,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Latency checkup details')}
      </Title>
      <Grid>
        <GridItem span={6}>
          <DescriptionList className="pf-c-description-list">
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.metadata?.name}
              descriptionHeader={t('Name')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<CheckupsNetworkStatusIcon configMap={configMap} job={job} />}
              descriptionHeader={t('Status')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
                  name={configMap?.metadata?.namespace}
                />
              }
              descriptionHeader={t('Namespace')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STATUS_AVG_LATENCY_NANO]
                  ? t('{{time}} Nanoseconds', {
                      time: configMap?.data?.[STATUS_AVG_LATENCY_NANO],
                    })
                  : NO_DATA_DASH
              }
              descriptionHeader={t('Average latency')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STATUS_MAX_LATENCY_NANO]
                  ? t('{{time}} Nanoseconds', {
                      time: configMap?.data?.[STATUS_MIN_LATENCY_NANO],
                    })
                  : NO_DATA_DASH
              }
              descriptionHeader={t('Maximum latency')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.data?.[STATUS_START_TIME_STAMP] || NO_DATA_DASH}
              descriptionHeader={t('Start time')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.data?.[STATUS_COMPILATION_TIME_STAMP] || NO_DATA_DASH}
              descriptionHeader={t('Complete time')}
            />
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList className="pf-c-description-list">
            <VirtualMachineDescriptionItem
              descriptionData={
                <ResourceLink
                  groupVersionKind={NetworkAttachmentDefinitionModelGroupVersionKind}
                  name={configMap?.data?.[STATUS_NAD_NAME]}
                  namespace={configMap?.data?.[STATUS_NAD_NAMESPACE]}
                />
              }
              descriptionHeader={t('NetworkAttachmentDefinition')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.data?.[STATUS_FAILURE_REASON] || t('None')}
              descriptionHeader={t('Failure reason')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={t('{{time}} seconds', {
                time: configMap?.data?.[STATUS_SAMPLE_DURATION],
              })}
              descriptionHeader={t('Measurement duration')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STATUS_MIN_LATENCY_NANO]
                  ? t('{{time}} Nanoseconds', {
                      time: configMap?.data?.[STATUS_MIN_LATENCY_NANO],
                    })
                  : NO_DATA_DASH
              }
              descriptionHeader={t('Minimum latency')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STATUS_SOURCE_NODE] ? (
                  <ResourceLink
                    groupVersionKind={modelToGroupVersionKind(NodeModel)}
                    name={configMap?.data?.[STATUS_SOURCE_NODE]}
                  />
                ) : (
                  NO_DATA_DASH
                )
              }
              descriptionHeader={t('Source node')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                configMap?.data?.[STATUS_TARGET_NODE] ? (
                  <ResourceLink
                    groupVersionKind={modelToGroupVersionKind(NodeModel)}
                    name={configMap?.data?.[STATUS_TARGET_NODE]}
                  />
                ) : (
                  NO_DATA_DASH
                )
              }
              descriptionHeader={t('Target node')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(JobModel)}
                  name={job?.metadata?.name}
                  namespace={job?.metadata?.namespace}
                />
              }
              descriptionHeader={t('Job')}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </>
  );
};

export default CheckupsNetworkDetailsPageSection;
