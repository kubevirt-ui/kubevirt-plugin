import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import {
  modelToGroupVersionKind,
  VolumeSnapshotModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import useSnapshots from '@kubevirt-utils/components/SelectSnapshot/useSnapshots';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap, getName } from '@kubevirt-utils/resources/shared';
import { formatQuantityString } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import {
  DATAVOLUME_SNAPSHOT_NAME,
  DATAVOLUME_SNAPSHOT_NAMESPACE,
  DISK_SIZE_FIELD,
  VM_CLUSTER_FIELD,
} from '../../../utils/constants';
import { getErrorSnapshotName } from '../../../utils/selectors';
import { diskSourceSnapshotVolumeNameFieldID } from '../../utils/constants';

const DiskSourceSnapshotVolumeSelectName: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<V1DiskFormState>();

  const vmCluster = watch(VM_CLUSTER_FIELD);
  const namespace = watch(DATAVOLUME_SNAPSHOT_NAMESPACE);

  const { error: loadError, snapshots, snapshotsLoaded } = useSnapshots(namespace, vmCluster);

  const snapshotNames = useMemo(() => snapshots?.map(getName), [snapshots]);

  if (loadError) return <ErrorAlert error={loadError} />;

  if (!snapshotsLoaded) return <Loading />;

  const snapshotsMapper = convertResourceArrayToMap(snapshots);
  const error = getErrorSnapshotName(errors);

  return (
    <Controller
      control={control}
      name={DATAVOLUME_SNAPSHOT_NAME}
      render={({ field: { onChange, value } }) => (
        <FormGroup
          fieldId={diskSourceSnapshotVolumeNameFieldID}
          id={diskSourceSnapshotVolumeNameFieldID}
          isRequired
          label={t('VolumeSnapshot name')}
        >
          <InlineFilterSelect
            options={snapshotNames?.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
              value: name,
            }))}
            placeholder={t('Select VolumeSnapshot')}
            selected={value}
            setSelected={(snapshotName) => {
              onChange(snapshotName);
              const selectedSnapshot = snapshotsMapper[snapshotName];
              const selectedSnapshotSize = selectedSnapshot?.status?.restoreSize;
              setValue(DISK_SIZE_FIELD, formatQuantityString(selectedSnapshotSize));
            }}
            toggleProps={{
              isDisabled: isEmpty(namespace),
              isFullWidth: true,
            }}
          />
          {error && (
            <FormGroupHelperText validated={ValidatedOptions.error}>
              {error?.message}
            </FormGroupHelperText>
          )}
        </FormGroup>
      )}
      rules={{
        required: t('VolumeSnapshot is required.'),
      }}
    />
  );
};

export default DiskSourceSnapshotVolumeSelectName;
