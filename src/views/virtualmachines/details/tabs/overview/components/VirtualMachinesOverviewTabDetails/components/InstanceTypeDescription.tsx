import React, { FC } from 'react';

import { ControllerRevisionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getInstanceTypeRevisionName,
  getPreferenceRevisionName,
} from '@kubevirt-utils/resources/instancetype/selectors';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher, getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

type InstanceTypeDescriptionProps = {
  vm: V1VirtualMachine;
};

const InstanceTypeDescription: FC<InstanceTypeDescriptionProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const None = <MutedTextSpan text={t('None')} />;

  const itMatcher = getInstanceTypeMatcher(vm);
  const preferenceMatcher = getPreferenceMatcher(vm);

  return (
    <>
      <DescriptionItem
        bodyContent={t(
          'A ControllerRevision resource is cloned from the InstanceType when creating the VirtualMachine',
        )}
        descriptionData={
          itMatcher ? (
            <MulticlusterResourceLink
              cluster={getCluster(vm)}
              displayName={itMatcher.name}
              groupVersionKind={ControllerRevisionModelGroupVersionKind}
              name={getInstanceTypeRevisionName(vm)}
              namespace={getNamespace(vm)}
            />
          ) : (
            None
          )
        }
        data-test-id="virtual-machine-overview-details-instance-type"
        descriptionHeader={t('InstanceType')}
        isPopover
      />
      <DescriptionItem
        bodyContent={t(
          'A ControllerRevision resource is cloned from the Preference when creating the VirtualMachine',
        )}
        descriptionData={
          preferenceMatcher ? (
            <MulticlusterResourceLink
              cluster={getCluster(vm)}
              displayName={preferenceMatcher.name}
              groupVersionKind={ControllerRevisionModelGroupVersionKind}
              name={getPreferenceRevisionName(vm)}
              namespace={getNamespace(vm)}
            />
          ) : (
            None
          )
        }
        data-test-id="virtual-machine-overview-details-preference"
        descriptionHeader={t('Preference')}
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.PREFERENCE}
      />
    </>
  );
};

export default InstanceTypeDescription;
