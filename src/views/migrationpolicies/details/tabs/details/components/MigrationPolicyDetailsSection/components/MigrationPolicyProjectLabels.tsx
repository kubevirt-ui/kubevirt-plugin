import React from 'react';

import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  LabelGroup,
} from '@patternfly/react-core';

import { MigrationPolicyMatchExpressionSelectorList } from '../../../../../../components/MigrationPolicyMatchExpressionSelectorList/MigrationPolicyMatchExpressionSelectorList';
import { MigrationPolicyMatchLabelSelectorList } from '../../../../../../components/MigrationPolicyMatchLabelSelectorList/MigrationPolicyMatchLabelSelectorList';

type MigrationPolicyVirtualMachineLabelsProps = {
  mp: V1alpha1MigrationPolicy;
};
const MigrationPolicyVirtualMachineLabels: React.FC<MigrationPolicyVirtualMachineLabelsProps> = ({
  mp,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

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
                initialLabels={mp?.spec?.selectors?.namespaceSelector?.matchLabels}
                onLabelsSubmit={(labels) =>
                  k8sPatch({
                    model: MigrationPolicyModel,
                    resource: mp,
                    data: [
                      {
                        op: 'replace',
                        path: '/spec/selectors/namespaceSelector/matchLabels',
                        value: labels,
                      },
                    ],
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
        {!isEmpty(mp?.spec?.selectors?.namespaceSelector) && (
          <LabelGroup isEditable className="migration-policy-selectors-group">
            <MigrationPolicyMatchExpressionSelectorList
              matchExpressions={mp?.spec?.selectors?.namespaceSelector?.matchExpressions}
            />
            <MigrationPolicyMatchLabelSelectorList
              matchLabels={mp?.spec?.selectors?.namespaceSelector?.matchLabels}
            />
          </LabelGroup>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default MigrationPolicyVirtualMachineLabels;
