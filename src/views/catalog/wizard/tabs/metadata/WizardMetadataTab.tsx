import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, PageSection, pluralize } from '@patternfly/react-core';

import { WizardDescriptionItem } from '../../components/WizardDescriptionItem';

import WizardMetadataLabels from './components/WizardMetadataLabels';

import './wizard-metadata-tab.scss';

const WizardMetadataTab: WizardTab = ({ vm, updateVM, loaded }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <PageSection className="wizard-metadata-tab">
      <SidebarEditor resource={vm} onResourceUpdate={(newVM) => updateVM(newVM)}>
        {(resource) => (
          <>
            <SidebarEditorSwitch />
            <DescriptionList className="wizard-metadata-tab__description-list">
              <WizardDescriptionItem
                title={t('Labels')}
                description={<WizardMetadataLabels labels={resource?.metadata?.labels} />}
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
                description={pluralize(
                  Object.values(resource?.metadata?.annotations || {})?.length,
                  'annotation',
                )}
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
          </>
        )}
      </SidebarEditor>
    </PageSection>
  );
};

export default WizardMetadataTab;
