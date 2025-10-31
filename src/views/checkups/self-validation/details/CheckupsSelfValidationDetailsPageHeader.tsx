import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1PersistentVolumeClaim,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
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

import { CHECKUP_URLS } from '../../utils/constants';
import CheckupsSelfValidationActions from '../components/CheckupsSelfValidationActions';
import DownloadResultsErrorModal from '../components/DownloadResultsErrorModal';

import DownloadResultsButton from './components/DownloadResultsButton';

type CheckupsSelfValidationDetailsPageHeaderProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  jobs: IoK8sApiBatchV1Job[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
};

const CheckupsSelfValidationDetailsPageHeader: FC<CheckupsSelfValidationDetailsPageHeaderProps> = ({
  configMap,
  jobs,
  pvcs,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [namespace] = useActiveNamespace();
  const { createModal } = useModal();

  const handleError = (error: null | string, url?: null | string) => {
    if (error) {
      createModal((props) => (
        <DownloadResultsErrorModal {...props} errorMessage={error} url={url || undefined} />
      ));
    }
  };

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Button
              onClick={() =>
                navigate(`/k8s/ns/${namespace}/checkups/${CHECKUP_URLS.SELF_VALIDATION}`)
              }
              isInline
              variant={ButtonVariant.link}
            >
              {t('Self Validation checkup')}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('Self validation checkup details')}</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <PaneHeading>
        <Title headingLevel="h1">
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 'var(--pf-v6-global--spacer--sm)',
            }}
          >
            <span>{getName(configMap)}</span>
          </div>
        </Title>
        <FlexItem>
          <Flex direction={{ default: 'row' }} gap={{ default: 'gapMd' }}>
            <DownloadResultsButton
              configMap={configMap}
              jobs={jobs}
              onError={handleError}
              pvcs={pvcs}
            />
            <FlexItem>
              <CheckupsSelfValidationActions configMap={configMap} jobs={jobs} />
            </FlexItem>
          </Flex>
        </FlexItem>
      </PaneHeading>
    </DetailsPageTitle>
  );
};

export default CheckupsSelfValidationDetailsPageHeader;
