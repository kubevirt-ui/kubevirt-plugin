import React, { FC } from 'react';
import { getSortedResourceKeys, getStatus } from 'src/views/quotas/utils/utils';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ApplicationAwareResourceQuota } from '@kubevirt-utils/resources/quotas/types';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import QuotaConsumptionRow from './components/QuotaConsumptionRow';

type QuotaConsumptionTableProps = {
  quota: ApplicationAwareResourceQuota;
};

const QuotaConsumptionTable: FC<QuotaConsumptionTableProps> = ({ quota }) => {
  const { t } = useKubevirtTranslation();

  const status = getStatus(quota);

  const resourceKeys = getSortedResourceKeys(quota);

  return (
    <Card>
      <CardTitle>{t('Quota details')}</CardTitle>
      <CardBody>
        <Table gridBreakPoint="">
          <Thead>
            <Tr>
              <Th>{t('Resource type')}</Th>
              <Th visibility={['hidden', 'visibleOnMd']}>{t('Capacity')}</Th>
              <Th>{t('Used')}</Th>
              <Th>{t('Max')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {resourceKeys.map((key) => (
              <QuotaConsumptionRow key={key} quotaStatus={status} resourceKey={key} />
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default QuotaConsumptionTable;
