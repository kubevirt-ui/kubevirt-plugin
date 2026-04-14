import React, { FC } from 'react';

import {
  ControllerRevisionModelGroupVersionKind,
  modelToGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getInstanceTypeModelFromMatcher,
  getInstanceTypeNameFromAnnotation,
} from '@kubevirt-utils/resources/instancetype/helper';
import { getInstanceTypeRevisionName } from '@kubevirt-utils/resources/instancetype/selectors';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher } from '@kubevirt-utils/resources/vm';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { Stack, StackItem } from '@patternfly/react-core';

type InstanceTypeConfigurationDescriptionDataProps = {
  vm: V1VirtualMachine;
};

const InstanceTypeConfigurationDescriptionData: FC<
  InstanceTypeConfigurationDescriptionDataProps
> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const itMatcher = getInstanceTypeMatcher(vm);
  const cluster = getCluster(vm);
  const inferFromVolume = itMatcher?.inferFromVolume;
  const revisionName = getInstanceTypeRevisionName(vm);
  const model = getInstanceTypeModelFromMatcher(itMatcher);
  const namespacedITNamespace = model.namespaced ? getNamespace(vm) : undefined;

  const revisionLinkDisplayName =
    itMatcher?.name || getInstanceTypeNameFromAnnotation(vm) || revisionName;

  if (itMatcher?.name) {
    return (
      <MulticlusterResourceLink
        cluster={cluster}
        groupVersionKind={modelToGroupVersionKind(model)}
        name={itMatcher.name}
        namespace={namespacedITNamespace || undefined}
      />
    );
  }

  if (inferFromVolume) {
    return (
      <Stack hasGutter>
        <StackItem>
          {t('Inferred from volume {{volumeName}}', { volumeName: inferFromVolume })}
        </StackItem>
        {revisionName && (
          <StackItem>
            <MulticlusterResourceLink
              cluster={cluster}
              displayName={revisionLinkDisplayName}
              groupVersionKind={ControllerRevisionModelGroupVersionKind}
              name={revisionName}
              namespace={getNamespace(vm)}
            />
          </StackItem>
        )}
      </Stack>
    );
  }

  if (revisionName) {
    return (
      <MulticlusterResourceLink
        cluster={cluster}
        displayName={revisionLinkDisplayName}
        groupVersionKind={ControllerRevisionModelGroupVersionKind}
        name={revisionName}
        namespace={getNamespace(vm)}
      />
    );
  }

  return <MutedTextSpan text={t('Not available')} />;
};

export default InstanceTypeConfigurationDescriptionData;
