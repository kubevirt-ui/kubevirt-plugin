import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';

import CheckupsStorageActions from '../components/CheckupsStorageActions';

type CheckupsStorageDetailsPageHeaderProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  jobs: IoK8sApiBatchV1Job[];
};

const CheckupsStorageDetailsPageHeader: FC<CheckupsStorageDetailsPageHeaderProps> = ({
  configMap,
  jobs,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [namespace] = useActiveNamespace();

  return (
    <>
      <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            isInline
            onClick={() => navigate(`/k8s/ns/${namespace}/checkups/storage`)}
            variant={ButtonVariant.link}
          >
            {t('Storage checkup')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{t('Storage checkup details')}</BreadcrumbItem>
      </Breadcrumb>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <Title className="co-section-heading" headingLevel="h2">
          {configMap?.metadata?.name}
        </Title>
        <FlexItem>
          <CheckupsStorageActions configMap={configMap} jobs={jobs} />
        </FlexItem>
      </Flex>
    </>
  );
};

export default CheckupsStorageDetailsPageHeader;
