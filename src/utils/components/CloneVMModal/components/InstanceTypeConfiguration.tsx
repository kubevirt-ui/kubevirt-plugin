import React, { FC } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1InstancetypeMatcher } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeModelFromMatcher } from '@kubevirt-utils/resources/instancetype/helper';
import useInstanceType from '@kubevirt-utils/resources/vm/hooks/useInstanceType';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Skeleton, TextListItem, TextListItemVariants } from '@patternfly/react-core';

type InstanceTypeConfigurationProps = {
  itMatcher: V1InstancetypeMatcher;
};

const InstanceTypeConfiguration: FC<InstanceTypeConfigurationProps> = ({ itMatcher }) => {
  const { t } = useKubevirtTranslation();
  const { instanceType, instanceTypeLoaded } = useInstanceType(itMatcher);

  return (
    <>
      <TextListItem className="text-muted" component={TextListItemVariants.dt}>
        {t('InstanceType')}
      </TextListItem>

      <TextListItem component={TextListItemVariants.dd}>
        {instanceTypeLoaded ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(getInstanceTypeModelFromMatcher(itMatcher))}
            namespace={instanceType.metadata.namespace}
          >
            {instanceType.metadata.name}
          </ResourceLink>
        ) : (
          <Skeleton className="pf-m-width-sm" />
        )}
      </TextListItem>
    </>
  );
};

export default InstanceTypeConfiguration;
