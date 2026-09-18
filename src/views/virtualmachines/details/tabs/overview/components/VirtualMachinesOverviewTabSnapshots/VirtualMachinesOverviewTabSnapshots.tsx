import type { FC } from 'react';
import { Link } from 'react-router';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Bullseye,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Divider,
  Flex,
  Label,
} from '@patternfly/react-core';
import TakeSnapshotButton from '@virtualmachines/details/tabs/snapshots/components/TakeSnapshotButton/TakeSnapshotButton';

import useSnapshotData from '../../../snapshots/hooks/useSnapshotData';
import { createURL } from '../../utils/utils';
import VirtualMachinesOverviewTabSnapshotsRow from './VirtualMachinesOverviewTabSnapshotsRow';

type VirtualMachinesOverviewTabSnapshotsProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabSnapshots: FC<VirtualMachinesOverviewTabSnapshotsProps> = ({
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { snapshots } = useSnapshotData(vm);
  const snapshotsTabLink = createURL('snapshots', location?.pathname);

  return (
    <div data-test="virtual-machine-overview-snapshots">
      <Card>
        <CardTitle>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <Link to={snapshotsTabLink}>
              {t('Snapshots ({{snapshots}})', { snapshots: snapshots.length || 0 })}
            </Link>
            <TakeSnapshotButton variant="link" vm={vm} />
          </Flex>
        </CardTitle>
        <Divider />
        <CardBody isFilled>
          {!isEmpty(snapshots) ? (
            snapshots?.map((snapshot) => (
              <VirtualMachinesOverviewTabSnapshotsRow
                key={snapshot?.metadata?.uid}
                snapshot={snapshot}
                vm={vm}
              />
            ))
          ) : (
            <Bullseye>{t('No snapshots found')}</Bullseye>
          )}
        </CardBody>
        {!isEmpty(snapshots) && (
          <CardFooter>
            <Link to={snapshotsTabLink}>
              <Label color="blue" variant="outline">
                {t('View more')}
              </Label>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabSnapshots;
