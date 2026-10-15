import { type FC } from 'react';

import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { getFamilySelectorVisibilityStatus } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/familyAvailabilityStatus';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import { isInstanceTypeSeries } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getName } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { Label, Skeleton } from '@patternfly/react-core';

type FamilyStatusCellProps = {
  row: V1beta1VirtualMachineClusterInstancetype;
};

const FamilyStatusCell: FC<FamilyStatusCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const { disabledFamilies, loaded } = useDisabledInstanceTypeFamilies(getCluster(row));

  if (!loaded) {
    return <Skeleton width="5rem" />;
  }

  if (!isRedHatInstanceType(row)) {
    return <>{NO_DATA_DASH}</>;
  }

  const instanceTypeName = getName(row);
  const family = instanceTypeName ? getInstanceTypePrefix(instanceTypeName) : undefined;
  if (!family) {
    return <>{NO_DATA_DASH}</>;
  }

  const isVisibleInSelectors = isInstanceTypeSeries(family) ? !disabledFamilies.has(family) : true;
  const { color, label } = getFamilySelectorVisibilityStatus(isVisibleInSelectors, t);

  return (
    <Label color={color} data-test={`family-status-${family}`} isCompact>
      {label}
    </Label>
  );
};

export default FamilyStatusCell;
