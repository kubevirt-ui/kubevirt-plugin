import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import ClusterDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

import useClearLocationDependentVM from '../hooks/useClearLocationDependentVM';

type ClusterFieldProps = {
  setPendingDefaultAccessCluster: (cluster: string | null) => void;
};

const ClusterField: FC<ClusterFieldProps> = ({ setPendingDefaultAccessCluster }) => {
  const { t } = useKubevirtTranslation();
  const [hubClusterName] = useHubClusterName();
  const { control, getValues, setValue } = useVMWizardForm();
  const clearLocationDependentVM = useClearLocationDependentVM();

  return (
    <FormGroup isRequired label={t('Cluster')}>
      <Controller
        control={control}
        name="deployment.cluster"
        render={({ field: { ref: _ref, value, ...field } }) => (
          <ClusterDropdown
            {...field}
            bookmarkCluster={hubClusterName}
            includeAllClusters={false}
            onChange={(selectedCluster) => {
              if (selectedCluster === getValues('deployment.cluster')) return;
              field.onChange(selectedCluster);
              setValue('deployment.folder', '');
              clearLocationDependentVM();

              if (getValues('deployment.project') === DEFAULT_NAMESPACE) {
                setPendingDefaultAccessCluster(selectedCluster);
                return;
              }

              setValue('deployment.project', '', {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            selectedCluster={value}
          />
        )}
      />
    </FormGroup>
  );
};

export default ClusterField;
