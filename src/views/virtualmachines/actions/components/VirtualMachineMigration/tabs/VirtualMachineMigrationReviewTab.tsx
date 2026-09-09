import React, { type FC, useMemo } from 'react';

import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  Alert,
  AlertVariant,
  Content,
  ContentVariants,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { getAllVolumesCount } from '../utils/utils';
import ReviewVolumesTable from './components/ReviewVolumesTable';

type VirtualMachineMigrationReviewTabProps = {
  defaultStorageClassName: string;
  destinationStorageClass: string;
  keepOriginalVolumes: boolean;
  migrationError: Error;
  migrationPlanName: string;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  vms: V1VirtualMachine[];
  vmStorageClassNames: string[];
};

const VirtualMachineMigrationReviewTab: FC<VirtualMachineMigrationReviewTabProps> = ({
  defaultStorageClassName,
  destinationStorageClass,
  keepOriginalVolumes,
  migrationError,
  migrationPlanName,
  pvcs,
  vms,
  vmStorageClassNames,
}) => {
  const { t } = useKubevirtTranslation();

  const allVolumesCount = useMemo((): number => getAllVolumesCount(vms), [vms]);
  const cluster = getCluster(vms?.[0]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2">{t('Review')}</Title>
        <Content component={ContentVariants.p}>
          {t(
            'Review the details to make sure everything looks right before starting the migration.',
          )}
        </Content>
      </StackItem>
      <StackItem>
        <ReviewVolumesTable
          allVolumesCount={allVolumesCount}
          cluster={cluster}
          defaultStorageClassName={defaultStorageClassName}
          destinationStorageClass={destinationStorageClass}
          keepOriginalVolumes={keepOriginalVolumes}
          migrationPlanName={migrationPlanName}
          pvcs={pvcs}
          vms={vms}
          vmStorageClassNames={vmStorageClassNames}
        />
        {migrationError && (
          <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
            {migrationError?.message}
          </Alert>
        )}
      </StackItem>
    </Stack>
  );
};

export default VirtualMachineMigrationReviewTab;
