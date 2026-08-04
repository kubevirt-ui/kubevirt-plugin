import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import CustomSelectionView from './components/CustomSelectionView/CustomSelectionView';
import ManualCapabilitiesTable from './components/ManualCapabilitiesTable/ManualCapabilitiesTable';
import { CapabilitiesDataProvider } from './context/CapabilitiesDataProvider';

import './recommended-capabilities-tab.scss';

const RecommendedCapabilitiesTab: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <CapabilitiesDataProvider>
      <Stack hasGutter>
        <StackItem className="recommended-capabilities-tab__title">
          <Title headingLevel="h2">{t('Manage Virtualization capabilities')}</Title>
        </StackItem>
        <StackItem className="recommended-capabilities-tab__card">
          <Card>
            <CardHeader>
              <CardTitle>{t('Install capabilities automatically')}</CardTitle>
            </CardHeader>
            <CardBody>
              <CustomSelectionView />
            </CardBody>
          </Card>
        </StackItem>
        <StackItem className="recommended-capabilities-tab__card">
          <Card>
            <CardHeader>
              <CardTitle>{t('Additional capabilities (manual setup required)')}</CardTitle>
            </CardHeader>
            <CardBody>
              <ManualCapabilitiesTable />
            </CardBody>
          </Card>
        </StackItem>
      </Stack>
    </CapabilitiesDataProvider>
  );
};

export default RecommendedCapabilitiesTab;
