import React from 'react';

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
const MigrationPolicyVirtualMachineLabels: React.FC<MigrationPolicyVirtualMachineLabelsProps> = ({
  mp,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const mpNamespaceSelector = mp?.spec?.selectors?.namespaceSelector;

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText className="migration-policy-description-item-header">
        {t('Project labels')}
        <Button
          isInline
          variant={ButtonVariant.link}
          className="migration-policy-description-item-header--action-button"
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <LabelsModal
                obj={mp}
                isOpen={isOpen}
                onClose={onClose}
                initialLabels={mpNamespaceSelector}
                onLabelsSubmit={(labels) =>
                  k8sUpdate({
                    model: MigrationPolicyModel,
                    data: ensureMigrationPolicyMatchLabels(mp, labels, 'namespaceSelector'),
                  })
                }
              />
            ))
          }
        >
          {t('Edit')}
        </Button>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>
        {!isEmpty(mpNamespaceSelector) && (
          <LabelGroup isEditable className="migration-policy-selectors-group">
            <MigrationPolicySelectorList selector={mpNamespaceSelector} />
          </LabelGroup>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default MigrationPolicyVirtualMachineLabels;
