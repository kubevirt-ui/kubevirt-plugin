import * as React from 'react';

import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Grid, GridItem, pluralize } from '@patternfly/react-core';

import { WizardVMContextType } from '../../../utils/WizardVMContext';
import { WizardDescriptionItem } from '../../components/WizardDescriptionItem';

import { WizardAnnotationsModal } from './components/WizardAnnotationsModal/WizardAnnotationsModal';
import WizardMetadataLabels from './components/WizardMetadataLabels';

const WizardMetadataTab: React.FC<WizardVMContextType> = ({ vm, updateVM, loaded }) => {
  const { t } = useKubevirtTranslation();
  const labels = vm?.metadata?.labels;
  const annotations = vm?.metadata?.annotations;

  const [isAnnotationsModalOpen, setAnnotationsModalOpen] = React.useState(false);
  const [isLabelsModalOpen, setLabelsModalOpen] = React.useState(false);

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
              onEditClick={() => setLabelsModalOpen(true)}
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
              onEditClick={() => setAnnotationsModalOpen(true)}
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
      <WizardAnnotationsModal
        vm={vm}
        updateVM={updateVM}
        isOpen={isAnnotationsModalOpen}
        onClose={() => setAnnotationsModalOpen(false)}
      />
      <LabelsModal
        obj={vm}
        onLabelsSubmit={(updatedLabels) =>
          updateVM((vmDraft) => {
            vmDraft.metadata.labels = updatedLabels;
          })
        }
        isOpen={isLabelsModalOpen}
        onClose={() => setLabelsModalOpen(false)}
      />
    </div>
  );
};

export default WizardMetadataTab;
