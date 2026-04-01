import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import DurationDropdown from '@kubevirt-utils/components/DurationOption/DurationDropdown';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { getNamespacePathSegment } from '@kubevirt-utils/utils/utils';
import { DocumentTitle, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  FlexItem,
  PageSection,
  Title,
} from '@patternfly/react-core';

import { MIGRATIONS_DURATION_KEY } from './utils/constants';
import MigrationsTab from './MigrationsTab';

import './MigrationsPage.scss';

const MigrationsPage: FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();

  const [duration, setDuration] = useLocalStorage(
    MIGRATIONS_DURATION_KEY,
    DurationOption.FIVE_MIN.toString(),
  );

  const onDurationSelect = (value: string) => {
    const parsed = DurationOption.fromDropdownLabel(value);
    if (parsed) setDuration(parsed.toString());
  };

  return (
    <>
      <DocumentTitle>{t('Compute migrations')}</DocumentTitle>
      <div className="migrations-page__layout">
        <PageSection className="migrations-page__sticky-header" hasBodyWrapper={false}>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link
                to={`/k8s/${getNamespacePathSegment(activeNamespace)}/${VirtualMachineModelRef}`}
              >
                {t('Virtualization')}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{t('Compute migrations')}</BreadcrumbItem>
          </Breadcrumb>
          <Flex alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem flex={{ default: 'flex_1' }}>
              <Title headingLevel="h1">{t('Compute migrations')}</Title>
            </FlexItem>
            <FlexItem spacer={{ default: 'spacerMd' }}>
              <DurationDropdown selectedDuration={duration} selectHandler={onDurationSelect} />
            </FlexItem>
          </Flex>
        </PageSection>
        <div className="migrations-page__content">
          <MigrationsTab duration={duration} />
        </div>
      </div>
    </>
  );
};

export default MigrationsPage;
