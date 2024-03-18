import React, { FC } from 'react';

import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  LabelGroup,
} from '@patternfly/react-core';

import { MigrationPolicySelectorList } from '../../../../../../components/MigrationPolicySelectorList/MigrationPolicySelectorList';
import { ensureMigrationPolicyMatchLabels } from '../utils/utils';

type MigrationPolicyVirtualMachineLabelsProps = {
  mp: V1alpha1MigrationPolicy;
};
const MigrationPolicyVirtualMachineLabels: FC<MigrationPolicyVirtualMachineLabelsProps> = ({
  mp,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const mpVirtualMachineSelector = mp?.spec?.selectors?.virtualMachineInstanceSelector;

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText className="migration-policy-description-item-header">
        {t('VirtualMachineInstance labels')}
        <Button
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <LabelsModal
                onLabelsSubmit={(labels) =>
                  k8sUpdate({
                    data: ensureMigrationPolicyMatchLabels(
                      mp,
                      labels,
                      'virtualMachineInstanceSelector',
                    ),
                    model: MigrationPolicyModel,
                  })
                }
                initialLabels={mpVirtualMachineSelector}
                isOpen={isOpen}
                obj={mp}
                onClose={onClose}
              />
            ))
          }
          className="migration-policy-description-item-header--action-button"
          isInline
          variant={ButtonVariant.link}
        >
          {t('Edit')}
        </Button>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>
        {!isEmpty(mpVirtualMachineSelector) && (
          <LabelGroup className="migration-policy-selectors-group" isEditable>
            <MigrationPolicySelectorList isVMILabel selector={mpVirtualMachineSelector} />
          </LabelGroup>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default MigrationPolicyVirtualMachineLabels;
