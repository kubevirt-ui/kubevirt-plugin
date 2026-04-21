import { FC } from 'react';
import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { Title } from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';

import { getSubtitleChecks } from './utils';

type MainReadinessCheckProps = {
  checks: boolean[];
  loadedChecks: boolean[];
};

const MainReadinessCheck: FC<MainReadinessCheckProps> = ({ checks, loadedChecks }) => {
  const { t } = useKubevirtTranslation();

  const subtitle = getSubtitleChecks(t, checks, loadedChecks);

  const errors = checks.filter((check, index) => !check && loadedChecks[index]);

  if (errors.length > 0) {
    return (
      <>
        <Title className="cross-cluster-migration-title" headingLevel="h6">
          <RedExclamationCircleIcon /> <span> {t('Some checks were not successful')}</span>
        </Title>
        <span>{subtitle}</span>
      </>
    );
  }

  if (loadedChecks.every((loaded) => loaded)) {
    return (
      <>
        <Title className="cross-cluster-migration-title" headingLevel="h6">
          <GreenCheckCircleIcon /> <span> {t('Ready to migrate')}</span>
        </Title>
        <span>{subtitle}</span>
      </>
    );
  }

  return (
    <>
      <Title className="cross-cluster-migration-title" headingLevel="h6">
        <InProgressIcon /> <span> {t('Migration readiness check in progress')}</span>
      </Title>
      <span>{subtitle}</span>
    </>
  );
};

export default MainReadinessCheck;
