import * as React from 'react';
import { Link } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
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

import SnapshotModal from '../../../snapshots/components/modal/SnapshotModal';
import useSnapshotData from '../../../snapshots/hooks/useSnapshotData';
import { createURL } from '../../utils/utils';

import VirtualMachinesOverviewTabSnapshotsRow from './VirtualMachinesOverviewTabSnapshotsRow';

import './virtual-machines-overview-tab-snapshots.scss';

type VirtualMachinesOverviewTabSnapshotsProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabSnapshots: React.FC<VirtualMachinesOverviewTabSnapshotsProps> = ({
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { snapshots } = useSnapshotData(vm?.metadata?.name, vm?.metadata?.namespace);
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
            {t('Snapshots ({{count}})', { count: snapshots.length || 0 })}
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
