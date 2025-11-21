import React, { FC } from 'react';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { Flex, FlexItem, Title } from '@patternfly/react-core';

import CheckupsDetailsPageBreadcrumb from '../../components/CheckupsDetailsPageBreadcrumb';
import { CHECKUP_URLS } from '../../utils/constants';
import CheckupsSelfValidationActions from '../components/actions/CheckupsSelfValidationActions';

import DownloadResultsButton from './components/DownloadResultsButton';

import './checkups-self-validation-details-page.scss';

type CheckupsSelfValidationDetailsPageHeaderProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  jobs: IoK8sApiBatchV1Job[];
};

const CheckupsSelfValidationDetailsPageHeader: FC<CheckupsSelfValidationDetailsPageHeaderProps> = ({
  configMap,
  jobs,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <DetailsPageTitle
      breadcrumb={
        <CheckupsDetailsPageBreadcrumb
          checkupType={CHECKUP_URLS.SELF_VALIDATION}
          detailsLabel={t('Self validation checkup details')}
          parentLabel={t('Self validation checkup')}
        />
      }
    >
      {configMap && (
        <PaneHeading>
          <Title headingLevel="h1">
            <div className="details-page-header-title">
              <span>{getName(configMap)}</span>
            </div>
          </Title>
          <FlexItem>
            <Flex direction={{ default: 'row' }} gap={{ default: 'gapMd' }}>
              <DownloadResultsButton configMap={configMap} job={jobs?.[0]} />
              <FlexItem>
                <CheckupsSelfValidationActions configMap={configMap} jobs={jobs} />
              </FlexItem>
            </Flex>
          </FlexItem>
        </PaneHeading>
      )}
    </DetailsPageTitle>
  );
};

export default CheckupsSelfValidationDetailsPageHeader;
