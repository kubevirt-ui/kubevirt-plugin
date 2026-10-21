import type { FC } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import EnableVSOCK from '@kubevirt-utils/components/EnableVSOCK/EnableVSOCK';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsVSOCKFeatureEnabled from '@kubevirt-utils/hooks/useVSOCKFeatureFlag/useIsVSOCKFeatureEnabled';
import { getName } from '@kubevirt-utils/resources/shared';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';

type VSOCKDetailsDescriptionItemProps = {
  disabledTooltipText?: string;
  isDisabled?: boolean;
  updateVSOCK: (checked: boolean) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const VSOCKDetailsDescriptionItem: FC<VSOCKDetailsDescriptionItemProps> = ({
  disabledTooltipText,
  isDisabled,
  updateVSOCK,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const clusterParam = useClusterParam();
  const cluster = getCluster(vm) ?? clusterParam;
  const vmName = getName(vm) ?? '';

  const { featureEnabled, isLoading } = useIsVSOCKFeatureEnabled(cluster);

  if (isLoading || !featureEnabled) {
    return null;
  }

  return (
    <DescriptionItem
      bodyContent={t(
        'Attaches a virtio-vsock device for direct communication between the guest and the host without a network interface.',
      )}
      breadcrumb="VirtualMachine.spec.template.spec.domain.devices.autoattachVSOCK"
      data-test={`${vmName}-enable-vsock`}
      descriptionData={
        <EnableVSOCK
          disabledTooltipText={disabledTooltipText}
          isDisabled={isDisabled}
          updateVSOCK={updateVSOCK}
          vm={vm}
        />
      }
      descriptionHeader={<SearchItem id="enable-vsock">{t('Enable VSOCK')}</SearchItem>}
      isPopover
      olsObj={vm}
      promptType={OLSPromptType.ENABLE_VSOCK}
    />
  );
};

export default VSOCKDetailsDescriptionItem;
