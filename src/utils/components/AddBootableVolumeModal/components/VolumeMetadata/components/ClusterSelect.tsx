import React, { FC, useCallback, useMemo } from 'react';

import { AddBootableVolumeState } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { SetBootableVolumeFieldType } from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { ManagedClusterModel } from '@multicluster/constants';
import { FormGroup } from '@patternfly/react-core';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

type ClusterSelectProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const ClusterSelect: FC<ClusterSelectProps> = ({ bootableVolume, setBootableVolumeField }) => {
  const { t } = useKubevirtTranslation();
  const [clusters, clustersLoaded] = useFleetClusterNames();

  const clusterOptions = useMemo(() => {
    return (clusters || [])?.map((cluster) => ({
      groupVersionKind: modelToGroupVersionKind(ManagedClusterModel),
      label: cluster,
      value: cluster,
    }));
  }, [clusters]);

  const handleSelect = useCallback(
    (value: string) => {
      setBootableVolumeField('bootableVolumeCluster')(value);
    },
    [setBootableVolumeField],
  );

  if (!clustersLoaded) return <Loading />;

  return (
    <FormGroup isRequired label={t('Cluster')}>
      <InlineFilterSelect
        options={clusterOptions}
        selected={bootableVolume.bootableVolumeCluster}
        setSelected={handleSelect}
        toggleProps={{ isFullWidth: true, placeholder: t('Select cluster') }}
      />
    </FormGroup>
  );
};

export default ClusterSelect;
