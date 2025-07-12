import React, { FC } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeModelFromMatcher } from '@kubevirt-utils/resources/instancetype/helper';
import { getInstanceTypeMatcher } from '@kubevirt-utils/resources/vm';
import useInstanceType from '@kubevirt-utils/resources/vm/hooks/useInstanceType';
import { getCluster } from '@multicluster/helpers/selectors';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Content, ContentVariants, Skeleton } from '@patternfly/react-core';

type InstanceTypeConfigurationProps = {
  vm: V1VirtualMachine;
};

const InstanceTypeConfiguration: FC<InstanceTypeConfigurationProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const itMatcher = getInstanceTypeMatcher(vm);
  const { instanceType, instanceTypeLoaded } = useInstanceType(itMatcher, getCluster(vm));

  return (
    <>
      <Content className="pf-v6-u-text-color-subtle" component={ContentVariants.dt}>
        {t('InstanceType')}
      </Content>

      <Content component={ContentVariants.dd}>
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
      </Content>
    </>
  );
};

export default InstanceTypeConfiguration;
