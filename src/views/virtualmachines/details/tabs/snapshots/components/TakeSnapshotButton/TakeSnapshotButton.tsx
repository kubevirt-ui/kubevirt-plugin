import { type FC, useCallback } from 'react';

import { VirtualMachineSnapshotModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HidableTooltip from '@kubevirt-utils/components/HidableTooltip/HidableTooltip';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SnapshotModal from '@kubevirt-utils/components/SnapshotModal/SnapshotModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

type TakeSnapshotButtonProps = {
  variant: 'create' | 'link';
  vm: V1VirtualMachine;
};

const TakeSnapshotButton: FC<TakeSnapshotButtonProps> = ({ variant, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [canCreateSnapshot] = useFleetAccessReview(
    asAccessReview(VirtualMachineSnapshotModel, vm, 'create') ?? {},
  );

  const label = t('Take snapshot');

  const openSnapshotModal = useCallback(() => {
    if (!canCreateSnapshot) {
      return;
    }
    createModal((props) => <SnapshotModal vm={vm} {...props} />);
  }, [canCreateSnapshot, createModal, vm]);

  const button =
    variant === 'create' ? (
      <ListPageCreateButton isDisabled={!canCreateSnapshot} onClick={openSnapshotModal}>
        {label}
      </ListPageCreateButton>
    ) : (
      <Button
        isAriaDisabled={!canCreateSnapshot}
        isDisabled={!canCreateSnapshot}
        isInline
        onClick={openSnapshotModal}
        variant={ButtonVariant.link}
      >
        {label}
      </Button>
    );

  return (
    <HidableTooltip content={getNoPermissionTooltipContent(t)} hidden={canCreateSnapshot}>
      {button}
    </HidableTooltip>
  );
};

export default TakeSnapshotButton;
