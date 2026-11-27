import React, { type FC } from 'react';

import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import useCanPatchFeaturesConfigMap from '@kubevirt-utils/hooks/useCanPatchFeaturesConfigMap';
import { getFamilySelectorVisibilityStatus } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/familyAvailabilityStatus';
import useDisabledInstanceTypeFamiliesData from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamiliesData';
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

const FamilyStatusLabel: FC<FamilyStatusCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const { disabledFamilies, loaded } = useDisabledInstanceTypeFamiliesData(getCluster(row));

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

// Family availability is only visible to users who can patch the features ConfigMap on the row's
// cluster. The access review is memoized per cluster, so this does not issue a request per row.
// Fails closed: no status (and no ConfigMap watch) until the review resolves as allowed.
const FamilyStatusCell: FC<FamilyStatusCellProps> = ({ row }) => {
  const [canEdit, canEditLoading] = useCanPatchFeaturesConfigMap(getCluster(row));

  if (canEditLoading) {
    return <Skeleton width="5rem" />;
  }

  if (!canEdit) {
    return <>{NO_DATA_DASH}</>;
  }

  return <FamilyStatusLabel row={row} />;
};

export default FamilyStatusCell;
