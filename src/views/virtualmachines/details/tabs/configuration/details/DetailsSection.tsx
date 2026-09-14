import React, { type FC, useEffect, useMemo, useState } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isInstanceTypeVM } from '@kubevirt-utils/resources/instancetype/helper';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { asAccessReview, getName } from '@kubevirt-utils/resources/shared';
import { type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem, Title } from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { isDeletionProtectionEnabled } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';

import DetailsSectionAccessItems from './components/DetailsSectionAccessItems';
import DetailsSectionBoot from './components/DetailsSectionBoot';
import DetailsSectionComputeItems from './components/DetailsSectionComputeItems';
import DetailsSectionDescription from './components/DetailsSectionDescription';
import DetailsSectionHardware from './components/DetailsSectionHardware';

import './details-section.scss';

type DetailsSectionProps = {
  allInstanceTypes: InstanceTypeUnion[];
  instanceTypeVM: V1VirtualMachine;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const DetailsSection: FC<DetailsSectionProps> = ({ allInstanceTypes, instanceTypeVM, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useFleetAccessReview(accessReview ?? {});
  const { featureEnabled: isGuestSystemLogsDisabled } = useFeatures(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );

  const logSerialConsole = vm?.spec?.template?.spec?.domain?.devices?.logSerialConsole;
  const [isCheckedGuestSystemAccessLog, setIsCheckedGuestSystemAccessLog] = useState<boolean>();
  const instanceType = useMemo(
    () =>
      allInstanceTypes.find(
        (instanceTypeResource) => getName(instanceTypeResource) === vm?.spec?.instancetype?.name,
      ),
    [allInstanceTypes, vm?.spec?.instancetype?.name],
  );
  useEffect(
    () =>
      setIsCheckedGuestSystemAccessLog(
        logSerialConsole ?? (logSerialConsole === undefined && !isGuestSystemLogsDisabled),
      ),
    [isGuestSystemLogsDisabled, logSerialConsole],
  );

  const vmName = getName(vm);
  const cpuMemoryVM = instanceTypeVM?.metadata?.uid === vm?.metadata?.uid ? instanceTypeVM : vm;
  const isInstanceType = isInstanceTypeVM(vm);
  const deletionProtectionEnabled = isDeletionProtectionEnabled(vm);

  if (!vm) {
    return <Loading />;
  }

  return (
    <div className="VirtualMachinesDetailsSection">
      <Title headingLevel="h2">
        <SearchItem id="details">{t('VirtualMachine details')}</SearchItem>
      </Title>
      <Grid>
        <GridItem span={5}>
          <DescriptionList>
            <DetailsSectionDescription vm={vm} />
            <DetailsSectionComputeItems
              allInstanceTypes={allInstanceTypes}
              canUpdateVM={canUpdateVM}
              cpuMemoryVM={cpuMemoryVM}
              instanceType={instanceType}
              isInstanceType={isInstanceType}
              vm={vm}
              vmi={vmi}
              vmName={vmName}
            />
            <DetailsSectionAccessItems
              deletionProtectionEnabled={deletionProtectionEnabled}
              isCheckedGuestSystemAccessLog={isCheckedGuestSystemAccessLog}
              isGuestSystemLogsDisabled={isGuestSystemLogsDisabled}
              setIsCheckedGuestSystemAccessLog={setIsCheckedGuestSystemAccessLog}
              vm={vm}
              vmi={vmi}
              vmName={vmName}
            />
          </DescriptionList>
        </GridItem>
        <GridItem span={5}>
          <DescriptionList>
            <DetailsSectionHardware vm={vm} vmi={vmi} />
            <DetailsSectionBoot
              canUpdateVM={canUpdateVM}
              instanceTypeVM={instanceTypeVM}
              vm={vm}
              vmi={vmi}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default DetailsSection;
