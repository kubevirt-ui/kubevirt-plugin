import React, { FC } from 'react';

import {
  JobModel,
  modelToGroupVersionKind,
  NamespaceModel,
  NetworkAttachmentDefinitionModelGroupVersionKind,
  NodeModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';

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
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
              <DescriptionListDescription>{configMap?.metadata?.name}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
              <CheckupsNetworkStatusIcon configMap={configMap} job={job} />
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
                  name={configMap?.metadata?.namespace}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Average latency')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STATUS_AVG_LATENCY_NANO]
                  ? t('{{time}} Nanoseconds', {
                      time: configMap?.data?.[STATUS_AVG_LATENCY_NANO],
                    })
                  : NO_DATA_DASH}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Maximum latency')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STATUS_MAX_LATENCY_NANO]
                  ? t('{{time}} Nanoseconds', {
                      time: configMap?.data?.[STATUS_MIN_LATENCY_NANO],
                    })
                  : NO_DATA_DASH}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Start time')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STATUS_START_TIME_STAMP] || NO_DATA_DASH}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Complete time')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STATUS_COMPILATION_TIME_STAMP] || NO_DATA_DASH}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('NetworkAttachmentDefinition')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ResourceLink
                  groupVersionKind={NetworkAttachmentDefinitionModelGroupVersionKind}
                  name={configMap?.data?.[STATUS_NAD_NAME]}
                  namespace={configMap?.data?.[STATUS_NAD_NAMESPACE]}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Failure reason')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STATUS_FAILURE_REASON] || t('None')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Measurement duration')}</DescriptionListTerm>
              <DescriptionListDescription>
                {t('{{time}} seconds', { time: configMap?.data?.[STATUS_SAMPLE_DURATION] })}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Minimum latency')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STATUS_MIN_LATENCY_NANO]
                  ? t('{{time}} Nanoseconds', {
                      time: configMap?.data?.[STATUS_MIN_LATENCY_NANO],
                    })
                  : NO_DATA_DASH}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Source node')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STATUS_SOURCE_NODE] ? (
                  <ResourceLink
                    groupVersionKind={modelToGroupVersionKind(NodeModel)}
                    name={configMap?.data?.[STATUS_SOURCE_NODE]}
                  />
                ) : (
                  NO_DATA_DASH
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Target node')}</DescriptionListTerm>
              <DescriptionListDescription>
                {configMap?.data?.[STATUS_TARGET_NODE] ? (
                  <ResourceLink
                    groupVersionKind={modelToGroupVersionKind(NodeModel)}
                    name={configMap?.data?.[STATUS_TARGET_NODE]}
                  />
                ) : (
                  NO_DATA_DASH
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Job')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(JobModel)}
                  name={job?.metadata?.name}
                  namespace={job?.metadata?.namespace}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      </Grid>
    </>
  );
};

export default CheckupsNetworkDetailsPageSection;
