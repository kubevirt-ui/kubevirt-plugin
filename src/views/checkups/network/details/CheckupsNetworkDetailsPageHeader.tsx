import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
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

import CheckupsNetworkActions from '../components/CheckupsNetworkActions';

type CheckupsNetworkDetailsPageHeaderProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
};

const CheckupsNetworkDetailsPageHeader: FC<CheckupsNetworkDetailsPageHeaderProps> = ({
  configMap,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [namespace] = useActiveNamespace();

  return (
    <>
      <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            isInline
            onClick={() => history.push(`/k8s/ns/${namespace}/checkups`)}
            variant={ButtonVariant.link}
          >
            {t('Network latency checkup')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{t('Latency checkup details')}</BreadcrumbItem>
      </Breadcrumb>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <Title className="co-section-heading" headingLevel="h2">
          {configMap?.metadata?.name}
        </Title>
        <FlexItem>
          <CheckupsNetworkActions configMap={configMap} />
        </FlexItem>
      </Flex>
    </>
  );
};

export default CheckupsNetworkDetailsPageHeader;
