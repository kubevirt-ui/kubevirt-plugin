import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SnapshotModal from '@kubevirt-utils/components/SnapshotModal/SnapshotModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Divider,
  Label,
} from '@patternfly/react-core';
import { Fleet } from '@stolostron/multicluster-sdk';

import useSnapshotData from '../../../snapshots/hooks/useSnapshotData';
import { createURL } from '../../utils/utils';

import VirtualMachinesOverviewTabSnapshotsRow from './VirtualMachinesOverviewTabSnapshotsRow';

import './virtual-machines-overview-tab-snapshots.scss';

type VirtualMachinesOverviewTabSnapshotsProps = {
  vm: Fleet<V1VirtualMachine>;
};

const VirtualMachinesOverviewTabSnapshots: React.FC<VirtualMachinesOverviewTabSnapshotsProps> = ({
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { snapshots } = useSnapshotData(vm?.metadata?.name, vm?.metadata?.namespace, vm.cluster);
  const { createModal } = useModal();
  const snapshotsTabLink = createURL('snapshots', location?.pathname);

  return (
    <div
      className="VirtualMachinesOverviewTabSnapshots--main"
      data-test-id="virtual-machine-overview-snapshots"
    >
      <Card>
        <CardTitle className="text-muted">
          <Link to={snapshotsTabLink}>
            {t('Snapshots ({{snapshots}})', { snapshots: snapshots.length || 0 })}
          </Link>

          <Button
            isInline
            onClick={() => createModal((props) => <SnapshotModal vm={vm} {...props} />)}
            variant={ButtonVariant.link}
          >
            {t('Take snapshot')}
          </Button>
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
                {t('View More')}
              </Label>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabSnapshots;
