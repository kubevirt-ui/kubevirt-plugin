import * as React from 'react';

import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Grid, GridItem, pluralize } from '@patternfly/react-core';

import { WizardVMContextType } from '../../../utils/WizardVMContext';
import { WizardDescriptionItem } from '../../components/WizardDescriptionItem';

import WizardMetadataLabels from './components/WizardMetadataLabels';

const WizardMetadataTab: React.FC<WizardVMContextType> = ({ vm, updateVM, loaded }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const labels = vm?.metadata?.labels;
  const annotations = vm?.metadata?.annotations;

  return (
    <div className="co-m-pane__body">
      <Grid hasGutter>
        <GridItem span={5} rowSpan={4}>
          <DescriptionList>
            <WizardDescriptionItem
              title={t('Labels')}
              description={<WizardMetadataLabels labels={labels} />}
              isDisabled={!loaded}
              isEdit
              onEditClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <LabelsModal
                    obj={vm}
                    onLabelsSubmit={(updatedLabels) =>
                      updateVM((vmDraft) => {
                        vmDraft.metadata.labels = updatedLabels;
                      })
                    }
                    isOpen={isOpen}
                    onClose={onClose}
                  />
                ))
              }
              testId="wizard-metadata-labels"
              showEditOnTitle
              helperPopover={{
                header: t('Labels'),
                content: t(
                  'Map of string keys and values that can be used to organize and categorize (scope and select) objects',
                ),
              }}
            />

            <WizardDescriptionItem
              title={t('Annotations')}
              description={pluralize(Object.values(annotations || {})?.length, 'annotation')}
              isDisabled={!loaded}
              isEdit
              onEditClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <AnnotationsModal
                    obj={vm}
                    onSubmit={(updatedAnnotations) =>
                      updateVM((vmDraft) => {
                        vmDraft.metadata.annotations = updatedAnnotations;
                      })
                    }
                    isOpen={isOpen}
                    onClose={onClose}
                  />
                ))
              }
              testId="wizard-metadata-annotations"
              helperPopover={{
                header: t('Annotations'),
                content: t(
                  'Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects',
                ),
              }}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default WizardMetadataTab;
