import React, { FC } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeModelFromMatcher } from '@kubevirt-utils/resources/instancetype/helper';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher } from '@kubevirt-utils/resources/vm';
import useInstanceType from '@kubevirt-utils/resources/vm/hooks/useInstanceType';
import { getCluster } from '@multicluster/helpers/selectors';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Skeleton } from '@patternfly/react-core';

type InstanceTypeConfigurationProps = {
  vm: V1VirtualMachine;
};

const InstanceTypeConfiguration: FC<InstanceTypeConfigurationProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const itMatcher = getInstanceTypeMatcher(vm);
  const { instanceType, instanceTypeLoaded } = useInstanceType(itMatcher, getCluster(vm));

  return (
    <DescriptionItem
      descriptionData={
        instanceTypeLoaded ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(getInstanceTypeModelFromMatcher(itMatcher))}
            namespace={getNamespace(instanceType)}
          >
            {getName(instanceType)}
          </ResourceLink>
        ) : (
          <Skeleton className="pf-m-width-sm" />
        )
      }
      descriptionHeader={t('InstanceType')}
    />
  );
};

export default InstanceTypeConfiguration;
