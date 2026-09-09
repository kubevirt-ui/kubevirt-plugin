// Extracted from QuotasList.tsx
// Root: src/views/quotas/list/QuotasList.tsx

import React, { type FC, type MouseEvent } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { QuotaScope } from '../constants';

import QuotasCreateButton from './QuotasCreateButton';
import QuotasLearnMoreLink from './QuotasLearnMoreLink';

type QuotasListHeaderProps = {
  activeTab: QuotaScope;
  handleTabSelect: (_event: MouseEvent, tabKey: QuotaScope) => void;
  namespace: string;
  showEmptyState: boolean;
  showTabs: boolean;
};

const QuotasListHeader: FC<QuotasListHeaderProps> = ({
  activeTab,
  handleTabSelect,
  namespace,
  showEmptyState,
  showTabs,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader
        helpText={
          <>
            <div className="pf-v6-u-text-color-subtle pf-v6-u-my-sm">
              {t(
                'Define and monitor quotas for virtual machines and pods using Application Aware Quota. AAQ provides more accurate quota enforcement for virtualized workloads and is designed to fully replace Kubernetes ResourceQuota.',
              )}
            </div>
            <div>
              <QuotasLearnMoreLink />
            </div>
          </>
        }
        title={t('Application-aware quotas')}
      >
        {!showEmptyState && <QuotasCreateButton namespace={namespace} />}
      </ListPageHeader>
      {showTabs && (
        <Tabs activeKey={activeTab} onSelect={handleTabSelect} usePageInsets>
          <Tab
            eventKey={QuotaScope.PROJECT}
            title={<TabTitleText>{t('Project-scoped')}</TabTitleText>}
          />
          <Tab
            eventKey={QuotaScope.CLUSTER}
            title={<TabTitleText>{t('Cluster-scoped')}</TabTitleText>}
          />
        </Tabs>
      )}
    </>
  );
};

export default QuotasListHeader;
