import React, { FC } from 'react';
import StandardResourceQuotaAlert from 'src/views/quotas/components/StandardResourceQuotaAlert';

import { ApplicationAwareResourceQuota } from '@kubevirt-utils/resources/quotas/types';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { Loading } from '@patternfly/quickstarts';
import { Bullseye, Flex, PageSection, Stack } from '@patternfly/react-core';

import { getSortedResourceKeys, getStatus } from '../../../utils/utils';
import StatusChart from '../../components/StatusChart';

import QuotaConsumptionTable from './QuotaConsumptionTable/QuotaConsumptionTable';
import QuotaDetailsGrid from './QuotaDetailsGrid';

type QuotaDetailsTabProps = {
  obj?: ApplicationAwareResourceQuota;
};

const QuotaDetailsTab: FC<QuotaDetailsTabProps> = ({ obj: quota }) => {
  if (!quota) {
    return (
      <PageSection>
        <Bullseye>
          <Loading />
        </Bullseye>
      </PageSection>
    );
  }

  const { hard, used } = getStatus(quota);

  const resourceKeys = getSortedResourceKeys(quota);

  return (
    <PageSection>
      <Stack hasGutter>
        <StandardResourceQuotaAlert namespace={getNamespace(quota)} />
        <Flex gap={{ default: 'gapMd' }}>
          {resourceKeys.map((key) => (
            <StatusChart hard={hard[key]} key={key} resourceKey={key} used={used[key]} />
          ))}
        </Flex>
        <QuotaDetailsGrid quota={quota} />
        <QuotaConsumptionTable quota={quota} />
      </Stack>
    </PageSection>
  );
};

export default QuotaDetailsTab;
