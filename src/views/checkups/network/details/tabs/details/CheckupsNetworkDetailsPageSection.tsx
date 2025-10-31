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
import { DescriptionList, Grid, GridItem, PageSection, Title } from '@patternfly/react-core';

import CheckupsNetworkStatusIcon from '../../../../CheckupsStatusIcon';
import {
  STATUS_COMPLETION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
} from '../../../../utils/utils';
import {
  CONFIG_PARAM_NAD_NAME,
  CONFIG_PARAM_NAD_NAMESPACE,
  CONFIG_PARAM_SAMPLE_DURATION,
  CONFIG_PARAM_SOURCE_NODE,
  CONFIG_PARAM_TARGET_NODE,
  STATUS_AVG_LATENCY_NANO,
  STATUS_MAX_LATENCY_NANO,
  STATUS_MIN_LATENCY_NANO,
  STATUS_SOURCE_NODE,
  STATUS_TARGET_NODE,
} from '../../../utils/utils';

type CheckupsNetworkDetailsPageSectionProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  job: IoK8sApiBatchV1Job;
};

const CheckupsNetworkDetailsPageSection: FC<CheckupsNetworkDetailsPageSectionProps> = ({
  configMap,
  job,
}) => {
  const { t } = useKubevirtTranslation();

  const sourceNode =
    configMap?.data?.[STATUS_SOURCE_NODE] || configMap?.data?.[CONFIG_PARAM_SOURCE_NODE];
  const targetNode =
    configMap?.data?.[STATUS_TARGET_NODE] || configMap?.data?.[CONFIG_PARAM_TARGET_NODE];

  return (
    <PageSection>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Latency checkup details')}
      </Title>
      <Grid>
        <GridItem span={6}>
          <DescriptionList>
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
                      time: configMap?.data?.[STATUS_MAX_LATENCY_NANO],
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
              descriptionData={configMap?.data?.[STATUS_COMPLETION_TIME_STAMP] || NO_DATA_DASH}
              descriptionHeader={t('Complete time')}
            />
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <VirtualMachineDescriptionItem
              descriptionData={
                <ResourceLink
                  groupVersionKind={NetworkAttachmentDefinitionModelGroupVersionKind}
                  name={configMap?.data?.[CONFIG_PARAM_NAD_NAME]}
                  namespace={configMap?.data?.[CONFIG_PARAM_NAD_NAMESPACE]}
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
                time: configMap?.data?.[CONFIG_PARAM_SAMPLE_DURATION],
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
                sourceNode ? (
                  <ResourceLink
                    groupVersionKind={modelToGroupVersionKind(NodeModel)}
                    name={sourceNode}
                  />
                ) : (
                  NO_DATA_DASH
                )
              }
              descriptionHeader={t('Source node')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                targetNode ? (
                  <ResourceLink
                    groupVersionKind={modelToGroupVersionKind(NodeModel)}
                    name={targetNode}
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
    </PageSection>
  );
};

export default CheckupsNetworkDetailsPageSection;
